const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const chardet = require("chardet");
const iconv = require("iconv-lite");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const BookModel = require("../models/BookModel");

const AuthorModel = require("../models/AuthorModel");
const BookAuthorModel = require("../models/BookAuthorModel");

const SerieModel = require("../models/SerieModel");
const BookSerieModel = require("../models/BookSerieModel");

const GenreModel = require("../models/GenreModel");
const BookGenreModel = require("../models/BookGenreModel");

const { getAllFiles, removeEmptyDirs } = require("./FileScanner");

const { LOG_FILE } = require("../../core/constants");

/**
 * =========================
 * IMPORT FILTER RULES
 * =========================
 */
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

/**
 * =========================
 * XML PARSER
 * =========================
 */
const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true
});

/**
 * =========================
 * HASH
 * =========================
 */
function hashFile(buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * =========================
 * SMART ENCODING READER
 * =========================
 */
function readFileSmart(filePath) {
    const buffer = fs.readFileSync(filePath);
    let encoding = chardet.detect(buffer) || "utf-8";
    encoding = encoding.toLowerCase();
    if (encoding.includes("windows-1251") || encoding.includes("cp1251")) {
        encoding = "win1251";
    }
    return iconv.decode(buffer, encoding);
}

function detectEncoding(buffer) {
    let encoding = chardet.detect(buffer) || "utf-8";
    encoding = encoding.toLowerCase();
    if (encoding.includes("windows-1251") || encoding.includes("cp1251")) {
        encoding = "win1251";
    }
    return encoding;
}

/**
 * =========================
 * AUTHORS
 * =========================
 */
function extractAuthors(json) {
    try {
        const info = json?.FictionBook?.description?.["title-info"];
        if (!info || !info.author) return [];

        const authors = Array.isArray(info.author)
            ? info.author
            : [info.author];

        return authors.map(a => ({
            firstname: a["first-name"] || "Unknown",
            middlename: a["middle-name"] || null,
            lastname: a["last-name"] || "Author"
        }));
    } catch {
        return [];
    }
}

/**
 * =========================
 * LANGUAGE
 * =========================
 */
function extractLanguage(json) {
    return json?.FictionBook?.description?.["title-info"]?.lang || null;
}

/**
 * =========================
 * GENRES
 * =========================
 */
function extractGenres(json) {
    try {
        const info = json?.FictionBook?.description?.["title-info"];
        if (!info?.genre) return [];

        return Array.isArray(info.genre)
            ? info.genre
            : [info.genre];
    } catch {
        return [];
    }
}

/**
 * =========================
 * SERIES (NEW)
 * =========================
 */
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

/**
 * =========================
 * extractAnnotation
 * =========================
 */
function extractAnnotation(json) {
    try {
        const annotation = json?.FictionBook?.description?.["title-info"]?.annotation;
        if (!annotation) return null;
        if (typeof annotation === "string") {
            return annotation.trim();
        }
        if (typeof annotation === "object") {
            return Object.values(annotation).flat().map(v => typeof v === "string" ? v : "").join(" ").replace(/\s+/g, " ").trim();
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * =========================
 * TITLE
 * =========================
 */
function extractTitle(json, fallback) {
    return ( json?.FictionBook?.description?.["title-info"]?.["book-title"] || fallback );
}

/**
 * =========================
 * FILTER ENGINE
 * =========================
 */
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

    const badGenre = genres.find(g =>
        IMPORT_BLOCKED_GENRES?.includes(g)
    );
    if (badGenre) {
        return `genre blocked: ${badGenre}`;
    }

    if (IMPORT_ALLOWED_GENRES?.length) {
        const ok = genres.some(g =>
            IMPORT_ALLOWED_GENRES.includes(g)
        );
        if (!ok) {
            const g = genres.join(', ');
            return `genre not allowed: ${g}`;
        }
    }

    return null;
}

/**
 * =========================
 * PARSE BOOK
 * =========================
 */
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
         authors = [AuthorModel.getById('000000000000000000000000')];
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
/**
 * =========================
 * IMPORT MAIN
 * =========================
 */
function Log(msg) {
    fs.appendFileSync(LOG_FILE, msg + "\n");
    console.log(msg);
}

function removeBinaryNodes(fb2Content) {
    const localParser = new XMLParser({ ignoreAttributes: false });
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true
    });
    const json = localParser.parse(fb2Content);
    function removeBinary(obj) {
        if (!obj || typeof obj !== "object") return;
        delete obj.binary; // <-- THIS is the key line
        for (const key in obj) {
            removeBinary(obj[key]);
        }
    }
    removeBinary(json);
    return builder.build(json);
}

function importBooks() {
    const files = getAllFiles();

    let imported = 0;
    let skipped = 0;
    let deleted = 0;
    let index = 0;
    let total = files.length;


    const existing = new Set(
        BookModel.getAllHashes().map(b => b.hash)
    );

    Log(`Found ${files.length} files for importing...`);
    const totalStart = Date.now();
   
    for (const file of files) {
        Log(`------------------------------------------------------------------`);
        Log("\n");
        const bookStart = Date.now();
        try {
            index++;
            const parsed = parseBook(file);
            const book = parsed.book;

            // duplicate check
            if (existing.has(book.hash)) {
                skipped++;
                fs.unlinkSync(file);
                deleted++;

                Log(`${index}/${total}.SKIPPED duplicate: ${book.title} : ${file} : (${Date.now() - bookStart}ms)`);
                continue;
            }

            // filter rules
            const reason = shouldSkipImport({
                authors: parsed.authors,
                language: book.language,
                genres: parsed.genres, 
                encoding: parsed.encoding 
            });

            if (reason) {
                skipped++;

                Log(`${index}/${total}.SKIPPED (${reason}): ${book.title} : ${file} : (${Date.now() - bookStart}ms)`);
                continue;
            }

            // save book
            BookModel.create(book);
            existing.add(book.hash);
            imported++;

            Log(`${index}/${total}.IMPORTED: ${book.title} : ${file} : (${Date.now() - bookStart}ms)`);

            if (parsed.authors.length > 0) {
                for (const a of parsed.authors) {
                    const author = AuthorModel.getOrCreate( a.firstname, a.middlename, a.lastname );
                    BookAuthorModel.link(book.book_id, author.author_id);
                    Log( ` - AUTHOR: ${a.lastname}, ${a.firstname}${a.middlename ? " " + a.middlename : ""}` );
                }
            }

            if (parsed.genres.length > 0) {
                for (const g of parsed.genres) {
                    const genre = GenreModel.getOrCreate(g);
                    if (genre) { BookGenreModel.link(book.book_id, genre.genre_id); }
                    Log(` - GENRE: ${g}`);
                }
            }
            
           if (parsed.series.length) {
               for (const s of parsed.series) {
                    const serie = SerieModel.getOrCreate(s.title);
                    BookSerieModel.link( book.book_id, serie.serie_id, s.number );
                    Log(` - SERIES: ${s.title} (#${s.number || "?"})` );
                }
            }

            const dest = path.join(FILES_DIR, `${book.hash}.fb2`);
            try {
		// 
		const buffer = fs.readFileSync(file);
	    	const encoding = detectEncoding(buffer);
    		const xml = iconv.decode(buffer, encoding);
    		const cleanedXml = removeBinaryNodes(xml);
    		fs.writeFileSync(dest, cleanedXml, "utf8"); // always safe
            } catch (e) {
                Log(`${index}/${total}.COPY FAILED: ${file} -> ${dest} ${e.message}`);
            }

            fs.unlinkSync(file);
            deleted++;

            Log(`${index}/${total}.DONE in ${Date.now() - bookStart}ms`);
            Log("\n");

        } catch (e) {
            Log(`FAILED: ${file} -> ${e.message}`);
        }
    }

    removeEmptyDirs();

    const totalMs = Date.now() - totalStart;
    const totalSec = (totalMs / 1000).toFixed(1);
    Log(`DONE in ${totalSec}s: \nimported=${imported}, \nskipped=${skipped}, \ndeleted=${deleted}`);

    return { imported, skipped, deleted };
}

module.exports = {
    importBooks
};