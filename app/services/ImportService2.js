const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const iconv = require("iconv-lite");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");
const { detectEncoding } = require("./encoding");

const db = require("../../core/db");

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

// Configuration
const BATCH_SIZE = 10;

let IMPORT_EXISTING_HASHES = new Set();

const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true
});

function hashFile(buffer) {
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    return `${hash.slice(0, 2)}/${hash}`;
}

/* -------------------- EXTRACTORS -------------------- */

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

                return (
                    g["#text"] ||
                    g["_text"] ||
                    g["$text"] ||
                    Object.values(g).find(v => typeof v === "string")
                );
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
        const a = json?.FictionBook?.description?.["title-info"]?.annotation;
        if (!a) return null;

        if (typeof a === "string") return a.trim();

        return Object.values(a)
            .flat()
            .map(v => (typeof v === "string" ? v : ""))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
    } catch {
        return null;
    }
}

function extractTitle(json) {
    return json?.FictionBook?.description?.["title-info"]?.["book-title"] || "";
}

/* -------------------- XML CLEAN -------------------- */

function removeBinaryNodes(fb2Content) {
    const localParser = new XMLParser({ ignoreAttributes: false });
    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

    const json = localParser.parse(fb2Content);

    const removeBinary = (obj) => {
        if (!obj || typeof obj !== "object") return;
        delete obj.binary;
        for (const k in obj) removeBinary(obj[k]);
    };

    removeBinary(json);
    return builder.build(json);
}

/* -------------------- UTILS -------------------- */

function flush() {
    return new Promise(resolve => setImmediate(resolve));
}

function log(msg) {
    fs.appendFileSync(LOG_FILE, msg + "\n");
    console.log(msg);
}

/* -------------------- SKIP LOGIC -------------------- */

function getSkipMessage(code) {
    const m = {
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
    return m[code] || "unknown";
}

function getSkipCode({ hash, authors, language, genres, encoding }) {
    if (IMPORT_EXISTING_HASHES.has(hash)) return 1;
    if (IMPORT_ALLOWED_LANGUAGES && !IMPORT_ALLOWED_LANGUAGES.includes(language)) return 2;
    if (IMPORT_BLOCKED_LANGUAGES?.includes(language)) return 3;
    if (IMPORT_ALLOWED_ENCODINGS?.length && !IMPORT_ALLOWED_ENCODINGS.includes(encoding)) return 4;
    if (IMPORT_BLOCKED_ENCODINGS?.includes(encoding)) return 5;

    if (genres.find(g => IMPORT_BLOCKED_GENRES?.includes(g))) return 6;
    if (IMPORT_ALLOWED_GENRES?.length && !genres.some(g => IMPORT_ALLOWED_GENRES.includes(g))) return 7;

    const authorsStr = authors.map(a =>
        `${a.firstname} ${a.middlename || ""} ${a.lastname}`.replace(/\s+/g, " ").trim()
    );

    if (authorsStr.some(a => IMPORT_BLOCKED_AUTHORS?.includes(a))) return 8;

    return 0;
}

/* -------------------- SAVE OPS (DB ONLY) -------------------- */

async function saveBook(book) {
    const created = BookModel.create(book);

    BooksFTSModel.insert({
        rowid: created.lastInsertRowid,
        title: book.title,
        annotation: book.annotation
    });
}

async function saveAuthors(book) {
    for (const a of book.authors) {
        const author = AuthorModel.getOrCreate(a.firstname, a.middlename, a.lastname);
        BookAuthorModel.link(book.book_id, author.author_id);
    }
}

async function saveGenres(book) {
    for (const g of book.genres) {
        const genre = GenreModel.getOrCreate(g);
        if (genre) BookGenreModel.link(book.book_id, genre.genre_id);
    }
}

async function saveSeries(book) {
    for (const s of book.series) {
        const serie = SerieModel.getOrCreate(s.title);
        BookSerieModel.link(book.book_id, serie.serie_id, s.number);
    }
}

/* -------------------- FILE OPS -------------------- */

function saveBookFile(book, xml) {
    const dest = path.join(FILES_DIR, `${book.hash}.fb2`);

    fs.mkdirSync(path.dirname(dest), { recursive: true });

    let result = false;
    try {
        fs.writeFileSync(dest, xml, "utf8");
        result = true;
    } catch {}

    return { dest, result };
}

/* -------------------- LOAD -------------------- */

function loadBook(buffer, encoding, xml) {
    let json;
    try {
        json = parser.parse(xml);
    } catch {
        throw new Error("XML parse failed");
    }

    const book_id = crypto.randomBytes(12).toString("hex");
    const hash = hashFile(buffer);

    let authors = extractAuthors(json);
    if (!authors.length) {
        authors = [AuthorModel.getById("000000000000000000000000")];
    }

    return {
        book_id,
        hash,
        title: extractTitle(json),
        language: extractLanguage(json),
        annotation: extractAnnotation(json),
        authors,
        genres: extractGenres(json),
        series: extractSeries(json),
        encoding
    };
}

/* -------------------- LOG ENTRY -------------------- */

function book2Log(file, book, encoding) {
    return {
        file,
        language: book.language,
        authors: book.authors,
        genres: book.genres,
        series: book.series,
        encoding,
        code: 0,
        msg: "",
        dest: "",
        result: false,
        time: 0
    };
}

function add2Entry(entry, copy) {
    entry.dest = copy.dest;
    entry.result = copy.result;
    return entry;
}

async function logLine(entry) {
    Log(`---------------------------------------`);
    Log(`Index: ${entry.index}`);
    Log(`---------------------------------------`);
    Log(`File: ${entry.file}`);
    Log(`Encoding: ${entry.encoding}`);
    Log(`Language: ${entry.language}`);
    entry.authors.forEach(a => {
        const f = `${a.firstname} ${a.middlename || ""} ${a.lastname}`.replace(/\s+/g, " ").trim();
        Log(`Author: ${f}`);
    });
    entry.genres.forEach(g => {
        Log(`Genre: ${g}`);
    });
    entry.series.forEach(s => {
        const si = s.number ? `${s.title} #${s.number}` : s.title;
        Log(`Serie: ${si}`);
    });
    Log(`Skip code: ${entry.code}`);
    if (entry.code > 0) {
        Log(`Skip msg: ${entry.msg}`);
    }
    Log(`Dest: ${entry.dest}`);
    Log(`Result: ${entry.result}`);
    Log(`Time: ${entry.time}`);

    Log(``);
}

/* -------------------- PREP -------------------- */

function prepareBatch(batch) {
    return batch.map(file => {
        const buffer = fs.readFileSync(file);
        const encoding = detectEncoding(buffer);
        const xml = iconv.decode(buffer, encoding);
        const cleanedXml = removeBinaryNodes(xml);

        const book = loadBook(buffer, encoding, xml);
        const entry = book2Log(file, book, encoding);

        entry.code = getSkipCode(book);

        return { file, buffer, encoding, xml, cleanedXml, book, entry };
    });
}

/* -------------------- TRANSACTION -------------------- */

const importBatchTx = db.transaction((items) => {
    for (const { book, entry } of items) {
        if (entry.code !== 0) continue;

        saveBook(book);
        saveAuthors(book);
        saveGenres(book);
        saveSeries(book);

        IMPORT_EXISTING_HASHES.add(book.hash);
    }
});

/* -------------------- FINALIZE -------------------- */

function finalizeBatch(items) {
    for (const { file, book, cleanedXml, entry } of items) {
        if (entry.code === 0) {
            const copy = saveBookFile(book, cleanedXml);
            add2Entry(entry, copy);
            fs.unlinkSync(file);
        } else {
            entry.msg = getSkipMessage(entry.code);
        }

        logLine(entry);
    }
}

/* -------------------- MAIN -------------------- */

async function importBooks() {

    const start = Date.now();

    const files = getAllFiles();

    IMPORT_EXISTING_HASHES = new Set(
        BookModel.getAllHashes().map(b => b.hash)
    );

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);

        const prepared = prepareBatch(batch);
        importBatchTx(prepared);
        finalizeBatch(prepared);

        await flush();
    }

    removeEmptyDirs();

    log(`Time: ${Date.now() - start}`);
}

module.exports = { importBooks };