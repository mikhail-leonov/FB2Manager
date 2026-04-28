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

const BooksFTSModel = require("../models/BooksFTSModel");

const { getAllFiles, removeEmptyDirs } = require("./FileScanner");

const { LOG_FILE } = require("../../core/constants");
const { preprocess } = require("../services/TextPreprocessor");

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

// Configuration for batch processing
const BATCH_SIZE = 10; // Process 10 books before yielding to event loop
const PROGRESS_INTERVAL = 5; // Log progress every 5 books

const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true
});

function hashFile(buffer) {
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const subdir = hash.slice(0, 2);
    return `${subdir}/${hash}`;
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

// Process a single book file
async function processBook(file, index, total, existing, encodingStats, languageStats, totalSize, Log, imported, skipped, deleted, importedBooks) {
    const stats = fs.statSync(file);
    const fileSize = stats.size;
    const sizeKB = fileSize / 1024;
    const sizeMB = sizeKB / 1024;
    
    Log(`File: ${file}`);
    Log(`Size: ${sizeKB.toFixed(2)} KB (${sizeMB.toFixed(2)} MB)`);

    const bookStart = Date.now();
    
    try {
        const parsed = parseBook(file);
        const book = parsed.book;

        Log(`Encoding: ${parsed.encoding}`);

        encodingStats.add(parsed.encoding);
        languageStats.add(parsed.book.language);

        if (existing.has(book.hash)) {
            fs.unlinkSync(file);
            Log(`Resolution: SKIPPED`);
            Log(`Reason: duplicate book`);
            Log(`Deleted: true`);
            Log(`Time: ${Date.now() - bookStart}ms`);
            Log("\n");
            return { imported, skipped: skipped + 1, deleted: deleted + 1, totalSize: totalSize + fileSize };
        }

        const reason = shouldSkipImport({
            authors: parsed.authors,
            language: book.language,
            genres: parsed.genres,
            encoding: parsed.encoding
        });

        if (reason) {
            Log(`Resolution: SKIPPED`);
            Log(`Reason: ${reason}`);
            Log(`Time: ${Date.now() - bookStart}ms`);
            Log("\n");
            return { imported, skipped: skipped + 1, deleted, totalSize: totalSize + fileSize };
        }

        const created = BookModel.create(book);
        BooksFTSModel.insert({
            rowid: created.lastInsertRowid,
            title: book.title,
            annotation: book.annotation
        });

        existing.add(book.hash);
        importedBooks.push(book);

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
        fs.mkdirSync(path.dirname(dest), { recursive: true });
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

        const bookTime = Date.now() - bookStart;
        Log(`Deleted: true`);

        if (bookTime > 3000) {
            Log(`Warning: Slow parse detected`);
        }

        const kbPerMs = sizeKB / bookTime;
        const msPerKB = bookTime / sizeKB;

        Log(`Time: ${bookTime} ms`);
        Log(`Speed: ${kbPerMs.toFixed(4)} KB/ms (${(kbPerMs * 1000).toFixed(2)} KB/s)`);
        Log(`Cost: ${msPerKB.toFixed(2)} ms/KB`);
        Log("\n");

        return { 
            imported: imported + 1, 
            skipped, 
            deleted: deleted + 1, 
            totalSize: totalSize + fileSize 
        };

    } catch (e) {
        Log(`Error: ${e.message}`);
        Log("\n");
        return { imported, skipped, deleted, totalSize: totalSize + fileSize };
    }
}

async function importBooks(onLog) {
    // Set global import status
    global.importInProgress = true;
    global.importStartTime = Date.now();
    global.importProgress = 0;

    function Log(msg) {
        fs.appendFileSync(LOG_FILE, msg + "\n");
        console.log(msg);
        if (onLog) onLog(msg);
    }

    const files = getAllFiles();
    let total = files.length;

    if (total === 0) {
        Log("No files found to import");
        global.importInProgress = false;
        return { imported: 0, skipped: 0, deleted: 0 };
    }

    let imported = 0;
    let skipped = 0;
    let deleted = 0;
    let totalSize = 0;
    let processedCount = 0;

    const encodingStats = new Set();
    const languageStats = new Set();
    const importedBooks = [];

    const existing = new Set(
        BookModel.getAllHashes().map(b => b.hash)
    );

    Log(`Found ${total} files for importing...`);
    Log(`Batch size: ${BATCH_SIZE} files per batch`);
    const totalStart = Date.now();

    // Process files in batches
    for (let batchStart = 0; batchStart < total; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, total);
        const batch = files.slice(batchStart, batchEnd);
        
        Log(`\n========== BATCH ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(total / BATCH_SIZE)} ==========`);
        Log(`Processing files ${batchStart + 1} to ${batchEnd} of ${total}\n`);
        
        // Process each file in the batch
        for (let i = 0; i < batch.length; i++) {
            const file = batch[i];
            const currentIndex = batchStart + i + 1;
            
            Log(`------------------------------------------------------------------`);
            Log(`Index: ${currentIndex}/${total} (Batch progress: ${i + 1}/${batch.length})`);
            Log(`------------------------------------------------------------------`);
            
            global.importProgress = currentIndex;
            
            const result = await processBook(
                file, currentIndex, total, existing, 
                encodingStats, languageStats, totalSize, 
                Log, imported, skipped, deleted, importedBooks
            );
            
            imported = result.imported;
            skipped = result.skipped;
            deleted = result.deleted;
            totalSize = result.totalSize;
            processedCount++;
            
            // Update global counters
            global.importProgress = processedCount;
            
            // Yield after each file
            await flush();
        }
        
        // Log batch completion
        const batchTime = Date.now() - totalStart;
        Log(`\n✓ Batch completed in ${(batchTime / 1000).toFixed(2)}s`);
        Log(`  Progress: ${processedCount}/${total} files (${Math.round(processedCount / total * 100)}%)`);
        Log(`  Imported: ${imported}, Skipped: ${skipped}, Deleted: ${deleted}\n`);
        
        // Force garbage collection hint after each batch (optional, requires --expose-gc)
        if (global.gc && batchStart % (BATCH_SIZE * 5) === 0) {
            global.gc();
            Log(`Memory garbage collection triggered`);
        }
        
        // Yield after each batch to ensure event loop responsiveness
        await flush();
    }

    removeEmptyDirs();

    // Log statistics
    Log(`\n========== IMPORT STATISTICS ==========`);
    Log(`\nEncodings detected:`);
    for (const enc of encodingStats) Log(`  - ${enc}`);
    Log("");

    Log(`Languages detected:`);
    for (const lng of languageStats) Log(`  - ${lng}`);
    Log("");

    const totalMs = Date.now() - totalStart;
    const totalSec = (totalMs / 1000).toFixed(2);

    const totalKB = totalSize / 1024;
    const totalMB = totalKB / 1024;
    const kbPerSecond = totalKB / (totalMs / 1000);
    const mbPerSecond = totalMB / (totalMs / 1000);
    const msPerTotalKB = totalMs / totalKB;

    Log(`Total size: ${totalKB.toFixed(2)} KB (${totalMB.toFixed(2)} MB)`);
    Log(`Total time: ${totalMs} ms (${totalSec}s)`);
    Log(`Average speed: ${kbPerSecond.toFixed(2)} KB/s (${mbPerSecond.toFixed(2)} MB/s)`);
    Log(`Cost: ${msPerTotalKB.toFixed(2)} ms/KB`);
    Log(`\nFinal Results:`);
    Log(`  Imported: ${imported}`);
    Log(`  Skipped: ${skipped}`);
    Log(`  Deleted: ${deleted}`);
    Log(`  Total processed: ${processedCount}/${total}`);
    Log(`\nDone: ${totalSec}s`);

    // Clear global import status
    global.importInProgress = false;
    global.importStartTime = null;
    global.importProgress = null;

    return { imported, skipped, deleted };
}

module.exports = { importBooks };