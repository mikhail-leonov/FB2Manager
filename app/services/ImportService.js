const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const chardet = require("chardet");
const iconv = require("iconv-lite");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");
const { detectEncoding } = require("./encoding");

const BookModel = require("../models/BookModel");

const AuthorModel = require("../models/AuthorModel");
const BookAuthorModel = require("../models/BookAuthorModel");

const SerieModel = require("../models/SerieModel");
const BookSerieModel = require("../models/BookSerieModel");

const GenreModel = require("../models/GenreModel");
const BookGenreModel = require("../models/BookGenreModel");

const { getAllFiles, removeEmptyDirs } = require("./FileScanner");

const { LOG_FILE } = require("../../core/constants");

const {
    IMPORT_ALLOWED_LANGUAGES,
    IMPORT_BLOCKED_LANGUAGES,
    IMPORT_BLOCKED_ENCODINGS,
    IMPORT_ALLOWED_ENCODINGS,
    IMPORT_BLOCKED_AUTHORS,
    IMPORT_ALLOWED_GENRES,
    IMPORT_BLOCKED_GENRES,
    FILES_DIR
} = require("../../core/constants");

const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true
});

function hashFile(buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
}

function extractAuthors(json) {
    try {
        const info = json?.FictionBook?.description?.["title-info"];
        if (!info || !info.author) return [];
        const authors = Array.isArray(info.author) ? info.author : [info.author];
        return authors.map(a => ({
            firstname: a["first-name"] || "Unknown",
            middlename: a["middle-name"] || null,
            lastname: a["last-name"] || "Author"
        }));
    } catch {
        return [];
    }
}

function extractLanguage(json) {
    return json?.FictionBook?.description?.["title-info"]?.lang || null;
}

function extractGenres(json) {
    try {
        const info = json?.FictionBook?.description?.["title-info"];
        if (!info?.genre) return [];
        const genres = Array.isArray(info.genre) ? info.genre : [info.genre];
        return genres
            .map(g => {
                if (!g) return null;
                if (typeof g === "string") return g;
                return (g["#text"] || g["_text"] || g["$text"] || (typeof g === "object" ? Object.values(g).find(v => typeof v === "string") : null));
            })
            .filter(Boolean);
    } catch {
        return [];
    }
}

function extractSeries(json) {
    try {
        const info = json?.FictionBook?.description?.["title-info"];
        if (!info?.sequence) return [];
        const seq = Array.isArray(info.sequence) ? info.sequence : [info.sequence];
        return seq.map(s => ({
            title: s["@_name"] || "Unknown Series",
            number: s["@_number"] ? Number(s["@_number"]) : null
        }));
    } catch {
        return [];
    }
}

function extractAnnotation(json) {
    try {
        const annotation = json?.FictionBook?.description?.["title-info"]?.annotation;
        if (!annotation) return null;
        if (typeof annotation === "string") return annotation.trim();
        if (typeof annotation === "object") {
            return Object.values(annotation).flat().map(v => typeof v === "string" ? v : "").join(" ").replace(/\s+/g, " ").trim();
        }
        return null;
    } catch {
        return null;
    }
}

function extractTitle(json, fallback) {
    return (json?.FictionBook?.description?.["title-info"]?.["book-title"] || fallback);
}

function shouldSkipImport({ authors, language, genres, encoding }) {
    if (IMPORT_ALLOWED_LANGUAGES && !IMPORT_ALLOWED_LANGUAGES.includes(language)) {
        return `language not allowed: ${language}`;
    }
    if (IMPORT_BLOCKED_LANGUAGES?.includes(language)) {
        return `language blocked: ${language}`;
    }
    if (IMPORT_ALLOWED_ENCODINGS?.length && !IMPORT_ALLOWED_ENCODINGS.includes(encoding)) {
        return `encoding not allowed: ${encoding}`;
    }
    if (IMPORT_BLOCKED_ENCODINGS?.includes(encoding)) {
        return `encoding blocked: ${encoding}`;
    }
    const authorNames = authors.map(a =>
        `${a.firstname} ${a.middlename || ""} ${a.lastname}`.replace(/\s+/g, " ").trim()
    );
    for (const a of authorNames) {
        if (IMPORT_BLOCKED_AUTHORS?.includes(a)) {
            return `author blocked: ${a}`;
        }
    }
    const badGenre = genres.find(g => IMPORT_BLOCKED_GENRES?.includes(g));
    if (badGenre) {
        return `genre blocked: ${badGenre}`;
    }
    if (IMPORT_ALLOWED_GENRES?.length) {
        const ok = genres.some(g => IMPORT_ALLOWED_GENRES.includes(g));
        if (!ok) {
            const g = genres.join(", ");
            return `genre not allowed: ${g}`;
        }
    }
    return null;
}

function parseBook(filePath) {
    const buffer = fs.readFileSync(filePath);
    const encoding = detectEncoding(buffer);
    const xml = iconv.decode(buffer, encoding);

    let json;
    try {
        json = parser.parse(xml);
    } catch {
        throw new Error("XML parse failed");
    }

    let authors = extractAuthors(json);
    if (!authors.length) {
        authors = [AuthorModel.getById("000000000000000000000000")];
    }

    const language = extractLanguage(json);
    const genres = extractGenres(json);
    const series = extractSeries(json);
    const title = extractTitle(json, path.basename(filePath));
    const annotation = extractAnnotation(json);

    return {
        book: {
            book_id: crypto.randomBytes(12).toString("hex"),
            title,
            language,
            annotation,
            publication_date: null,
            hash: hashFile(buffer)
        },
        authors,
        genres,
        series,
        encoding
    };
}

function removeBinaryNodes(fb2Content) {
    const localParser = new XMLParser({ ignoreAttributes: false });
    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
    const json = localParser.parse(fb2Content);
    function removeBinary(obj) {
        if (!obj || typeof obj !== "object") return;
        delete obj.binary;
        for (const key in obj) removeBinary(obj[key]);
    }
    removeBinary(json);
    return builder.build(json);
}

// Yields to the event loop so SSE writes are flushed to the client
function flush() {
    return new Promise(resolve => setImmediate(resolve));
}

async function importBooks(onLog) {
    function Log(msg) {
        fs.appendFileSync(LOG_FILE, msg + "\n");
        console.log(msg);
        if (onLog) onLog(msg);
    }

    const files = getAllFiles();

    let imported = 0;
    let skipped = 0;
    let deleted = 0;
    let index = 0;
    let total = files.length;
    let kbPerMs = 0;
    let msPerKB = 0;
    let totalSize = 0;

    const encodingStats = new Set();
    const languageStats = new Set();

    const existing = new Set(
        BookModel.getAllHashes().map(b => b.hash)
    );

    Log(`Found ${files.length} files for importing...`);
    const totalStart = Date.now();

    for (const file of files) {
        Log(`------------------------------------------------------------------`);
        Log(`Index: ${index}/${total}`);
        Log(`------------------------------------------------------------------`);
        Log(`File: ${file}`);

        const stats = fs.statSync(file);
	totalSize = totalSize + stats.size;
        const sizeKB = stats.size / 1024;
        const sizeMB = sizeKB / 1024;
        Log(`Size: ${sizeKB.toFixed(2)} KB (${sizeMB.toFixed(2)} MB)`);

        const bookStart = Date.now();
        try {
            index++;
            const parsed = parseBook(file);
            const book = parsed.book;
            Log(`Encoding: ${parsed.encoding}`);

            encodingStats.add(parsed.encoding);
            languageStats.add(parsed.book.language);

            if (existing.has(book.hash)) {
                skipped++;
                fs.unlinkSync(file);
                deleted++;
                Log(`Resolution: SKIPPED`);
                Log(`Reason: duplicate book`);
                Log(`Deleted: true`);
                Log(`Time: ${Date.now() - bookStart}ms`);
                Log("\n");
                await flush();
                continue;
            }

            const reason = shouldSkipImport({
                authors: parsed.authors,
                language: book.language,
                genres: parsed.genres,
                encoding: parsed.encoding
            });

            if (reason) {
                skipped++;
                Log(`Resolution: SKIPPED`);
                Log(`Reason: ${reason}`);
                Log(`Time: ${Date.now() - bookStart}ms`);
                Log("\n");
                await flush();
                continue;
            }

            BookModel.create(book);
            existing.add(book.hash);
            imported++;

            Log(`Resolution: IMPORTED`);

            if (parsed.authors.length > 0) {
                for (const a of parsed.authors) {
                    const author = AuthorModel.getOrCreate(a.firstname, a.middlename, a.lastname);
                    BookAuthorModel.link(book.book_id, author.author_id);
                    Log(`Author: ${a.lastname}, ${a.firstname}${a.middlename ? " " + a.middlename : ""}`);
                }
            }

            if (parsed.genres.length > 0) {
                for (const g of parsed.genres) {
                    const genre = GenreModel.getOrCreate(g);
                    if (genre) BookGenreModel.link(book.book_id, genre.genre_id);
                    Log(`Genre: ${g}`);
                }
            }

            if (parsed.series.length) {
                for (const s of parsed.series) {
                    const serie = SerieModel.getOrCreate(s.title);
                    BookSerieModel.link(book.book_id, serie.serie_id, s.number);
                    Log(`Serie: ${s.title} (#${s.number || "?"})`);
                }
            }

            const dest = path.join(FILES_DIR, `${book.hash}.fb2`);
            Log(`Copy file to: ${dest}`);

            try {
                const buffer = fs.readFileSync(file);
                const encoding = detectEncoding(buffer);
                const xml = iconv.decode(buffer, encoding);
                const cleanedXml = removeBinaryNodes(xml);
                fs.writeFileSync(dest, cleanedXml, "utf8");
                Log(`Copy result: OK`);
            } catch (e) {
                Log(`Copy result: Failed`);
                Log(`Reason: ${e.message}`);
            }

            fs.unlinkSync(file);
            deleted++;

            const bookTime = Date.now() - bookStart;
            Log(`Deleted: true`);

            if (bookTime > 3000) {
                Log(`Warning: Slow parse detected`);
            }

            kbPerMs = sizeKB / bookTime;
            msPerKB = bookTime / sizeKB;

            Log(`Time: ${bookTime} ms`);
            Log(`Speed: ${kbPerMs.toFixed(4)} KB/ms (${(kbPerMs * 1000).toFixed(2)} KB/s)`);
            Log(`Cost: ${msPerKB.toFixed(2)} ms/KB`);
            Log("\n");

        } catch (e) {
            Log(`Error: ${e.message}`);
        }

        // Yield to event loop after every file so SSE chunks are sent
        await flush();
    }

    removeEmptyDirs();

    Log(`Encodings:`);
    for (const enc of encodingStats) Log(`- ${enc}`);
    Log("\n");

    Log(`Languages:`);
    for (const lng of languageStats) Log(`- ${lng}`);
    Log("\n");

    const totalKB = totalSize / 1024;
    const totalMB = totalKB / 1024;
    const kbPerSecond = totalKB / (totalMs / 1000);
    const mbPerSecond = totalMB / (totalMs / 1000);
    const msPerTotalKB = totalMs / totalKB;

    Log(`Total size: ${totalKB.toFixed(2)} KB (${totalMB.toFixed(2)} MB)`);
    Log(`Total time: ${totalMs} ms`);
    Log(`Average speed: ${kbPerSecond.toFixed(2)} KB/s (${mbPerSecond.toFixed(2)} MB/s)`);
    Log(`Cost: ${msPerTotalKB.toFixed(2)} ms/KB`);
    Log(`Imported: ${imported}`);
    Log(`Skipped: ${skipped}`);
    Log(`Deleted: ${deleted}`);
    Log("\n");
    Log(`Done: ${totalSec}s`);

    return { imported, skipped, deleted };
}

module.exports = { importBooks };