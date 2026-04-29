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
const db = require("../../core/db");
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
const BATCH_SIZE = 10;
const PROGRESS_INTERVAL = 5;

const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true
});

// Skip codes:
// 0 = no skip (success)
// 1 = duplicate book
// 2 = language not allowed
// 3 = language blocked
// 4 = encoding not allowed
// 5 = encoding blocked
// 6 = genre blocked
// 7 = genre not allowed
// 8 = author blocked
// 9 = XML parse failed
// 10 = file read error
// 11 = other error

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

function getSkipCode({ authors, language, genres, encoding }) {

    // Check for duplicates first - code 1
    // (handled separately in processBook)
    
    // Language not allowed - code 2
    if (IMPORT_ALLOWED_LANGUAGES && !IMPORT_ALLOWED_LANGUAGES.includes(language)) {
        return 2;
    }
    
    // Language blocked - code 3
    if (IMPORT_BLOCKED_LANGUAGES?.includes(language)) {
        return 3;
    }
    
    // Encoding not allowed - code 4
    if (IMPORT_ALLOWED_ENCODINGS?.length && !IMPORT_ALLOWED_ENCODINGS.includes(encoding)) {
        return 4;
    }
    
    // Encoding blocked - code 5
    if (IMPORT_BLOCKED_ENCODINGS?.includes(encoding)) {
        return 5;
    }
    
    // Genre blocked - code 6
    const badGenre = genres.find(g => IMPORT_BLOCKED_GENRES?.includes(g));
    if (badGenre) {
        return 6;
    }
    
    // Genre not allowed - code 7
    if (IMPORT_ALLOWED_GENRES?.length) {
        const ok = genres.some(g => IMPORT_ALLOWED_GENRES.includes(g));
        if (!ok) {
            return 7;
        }
    }
    
    // Author blocked - code 8
    const authorNames = authors.map(a =>
        `${a.firstname} ${a.middlename || ""} ${a.lastname}`.replace(/\s+/g, " ").trim()
    );
    for (const a of authorNames) {
        if (IMPORT_BLOCKED_AUTHORS?.includes(a)) {
            return 8;
        }
    }
    
    return 0;
}

function getSkipMessage(code) {
    const messages = {
        0: "no skip",
        1: "duplicate book",
        2: "language not allowed",
        3: "language blocked",
        4: "encoding not allowed",
        5: "encoding blocked",
        6: "genre blocked",
        7: "genre not allowed",
        8: "author blocked",
        9: "XML parse failed",
        10: "file read error",
        11: "other error"
    };
    return messages[code] || "unknown error";
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

function flush() {
    return new Promise(resolve => setImmediate(resolve));
}

async function processBook(file, index, total, existing, encodingStats, languageStats, totalSize, Log, stats, importedBooks) {
    const fileSize = fs.statSync(file).size;
    const sizeKB = fileSize / 1024;
    const sizeMB = sizeKB / 1024;
    
    Log(`File: ${file}`);
    Log(`Size: ${sizeKB.toFixed(2)} KB (${sizeMB.toFixed(2)} MB)`);

    const bookStart = Date.now();
    
    try {
        const parsed = parseBook(file);
        const book = parsed.book;

        Log(`Encoding: ${parsed.encoding}`);
        Log(`Language: ${book.language || 'unknown'}`);

        encodingStats.add(parsed.encoding);
        languageStats.add(parsed.book.language);

        // Check for duplicates - code 1
        if (existing.has(book.hash)) {
            fs.unlinkSync(file);
            stats[1]++; // duplicate
            Log(`Skip Code: 1`);
            Log(`Skip Reason: ${getSkipMessage(1)} (hash: ${book.hash.substring(0, 16)}...)`);
            Log(`Deleted: true`);
            Log(`Time: ${Date.now() - bookStart}ms`);
            Log("\n");
            return { totalSize: totalSize + fileSize };
        }

        const skipCode = getSkipCode({
            authors: parsed.authors,
            language: book.language,
            genres: parsed.genres,
            encoding: parsed.encoding
        });

        if (skipCode > 0) {
            stats[skipCode]++;
            
            Log(`Skip Code: ${skipCode}`);
            Log(`Skip Reason: ${getSkipMessage(skipCode)}`);
            Log(`Time: ${Date.now() - bookStart}ms`);
            Log("\n");
            fs.unlinkSync(file);
            return { totalSize: totalSize + fileSize };
        }

        // Import the book
        const created = BookModel.create(book);
        BooksFTSModel.insert({
            rowid: created.lastInsertRowid,
            title: book.title,
            annotation: book.annotation
        });

        existing.add(book.hash);
        importedBooks.push(book);
        stats[0]++; // success

        Log(`Skip Code: 0`);
        Log(`Status: IMPORTED`);

        if (parsed.authors.length > 0) {
            for (const a of parsed.authors) {
                const author = AuthorModel.getOrCreate(a.firstname, a.middlename, a.lastname);
                BookAuthorModel.link(book.book_id, author.author_id);
                Log(`Author: ${a.lastname}, ${a.firstname}${a.middlename ? " " + a.middlename : ""}`);
            }
        } else {
            Log(`Author: default`);
            const defaultAuthor = AuthorModel.getOrCreate("Unknown", null, "Author");
            BookAuthorModel.link(book.book_id, defaultAuthor.author_id);
        }

        if (parsed.genres.length > 0) {
            for (const g of parsed.genres) {
                const genre = GenreModel.getOrCreate(g);
                if (genre) BookGenreModel.link(book.book_id, genre.genre_id);
                Log(`Genre: ${g}`);
            }
        } else {
            Log(`Genre: none`);
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
            Log(`Copy result: Failed (${e.message})`);
        }

        fs.unlinkSync(file);

        const bookTime = Date.now() - bookStart;
        Log(`Deleted: true`);
        Log(`Time: ${bookTime} ms`);
        Log("\n");

        return { totalSize: totalSize + fileSize };

    } catch (e) {
        // Determine error code
        let errorCode = 11; // other error default
        if (e.message.includes("XML")) {
            errorCode = 9; // XML parse failed
        } else if (e.message.includes("ENOENT") || e.message.includes("file")) {
            errorCode = 10; // file read error
        }
        
        stats[errorCode]++;
        
        Log(`Skip Code: ${errorCode}`);
        Log(`Skip Reason: ${getSkipMessage(errorCode)}`);
        Log(`Error: ${e.message}`);
        Log("\n");
        
        // Try to delete corrupted files
        try {
            fs.unlinkSync(file);
            Log(`Deleted corrupted file: true`);
        } catch (unlinkErr) {
            Log(`Deleted corrupted file: false (${unlinkErr.message})`);
        }
        
        return { totalSize: totalSize + fileSize };
    }
}

async function importBooks(onLog) {
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

    let totalSize = 0;
    let processedCount = 0;
    
    // Stats array where index = skip code
    // code 0 = imported, codes 1-11 = various skip reasons
    const stats = {
        0: 0,  // imported
        1: 0,  // duplicate
        2: 0,  // language not allowed
        3: 0,  // language blocked
        4: 0,  // encoding not allowed
        5: 0,  // encoding blocked
        6: 0,  // genre blocked
        7: 0,  // genre not allowed
        8: 0,  // author blocked
        9: 0,  // XML parse failed
        10: 0, // file read error
        11: 0  // other error
    };

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
    
    // Start transaction for the batch
    db.prepare('BEGIN TRANSACTION').run();
    
    try {
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
                Log, stats, importedBooks
            );
            
            totalSize = result.totalSize;
            processedCount++;
            global.importProgress = processedCount;
            await flush();
        }
        
        // Commit the transaction if all went well
        db.prepare('COMMIT').run();
        
    } catch (error) {
        // Rollback on any error
        db.prepare('ROLLBACK').run();
        Log(`\nBatch transaction failed, rolled back: ${error.message}`);
        throw error;
    }
    
    const batchTime = Date.now() - totalStart;
    Log(`\nBatch completed in ${(batchTime / 1000).toFixed(2)}s`);
    Log(`  Progress: ${processedCount}/${total} files (${Math.round(processedCount / total * 100)}%)`);
    
    // Show current stats after each batch
    const imported = stats[0];
    const skipped = total - imported;
    Log(`  Imported: ${imported} (code 0)`);
    Log(`  Skipped: ${skipped} (codes 1-11)`);
    
    // Show non-zero skip codes
    const skipCodes = [1,2,3,4,5,6,7,8,9,10,11];
    for (const code of skipCodes) {
        if (stats[code] > 0) {
            Log(`    code ${code}: ${stats[code]} (${getSkipMessage(code)})`);
        }
    }
    Log(``);
    
    if (global.gc && batchStart % (BATCH_SIZE * 5) === 0) {
        global.gc();
        Log(`Memory garbage collection triggered`);
    }
    
    await flush();
}

    removeEmptyDirs();

    // Log detailed statistics
    Log(`\n========== DETAILED SKIP STATISTICS ==========`);
    Log(`Total files processed: ${total}`);
    Log(``);
    
    const imported = stats[0];
    const skipped = total - imported;

    const totalMs = Date.now() - totalStart;
    const totalSec = (totalMs / 1000).toFixed(2);
    const totalKB = totalSize / 1024;
    const totalMB = totalKB / 1024;
    const kbPerSecond = totalKB / (totalMs / 1000);
    const mbPerSecond = totalMB / (totalMs / 1000);

    // Store breakdown in global for API access
    global.importBreakdown = stats;
    global.importInProgress = false;
    global.importStartTime = null;
    global.importProgress = null;

    return { 
        imported: stats[0], 
        skipped: skipped, 
        deleted: total - stats[0],
        breakdown: stats 
    };
}

module.exports = { importBooks };