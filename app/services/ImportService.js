const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const chardet = require("chardet");
const iconv = require("iconv-lite");
const { XMLParser } = require("fast-xml-parser");

const BookModel = require("../models/BookModel");

const AuthorModel = require("../models/AuthorModel");
const BookAuthorModel = require("../models/BookAuthorModel");

const SerieModel = require("../models/SerieModel");
const BookSerieModel = require("../models/BookSerieModel");

const GenreModel = require("../models/GenreModel");
const BookGenreModel = require("../models/BookGenreModel");

const { getAllFiles, removeEmptyDirs } = require("./FileScanner");

/**
 * =========================
 * IMPORT FILTER RULES
 * =========================
 */
const IMPORT_RULES = {
    allowedLanguages: ["en", "ru"],
    blockedLanguages: null,
    blockedAuthors: ["Some Author"],
    allowedGenres: [
        'asian_fantasy','sf_history','dystopian','sf_action','boyar_anime',
        'everyday_fantasy','sf_heroic','sf_fantasy_city','sf_detective',
        'dorama','foreign_sf','historical_fantasy','sf_cyberpunk',
        'sf_space','sf_litrpg','magic_school','sf_mystic',
        'fairy_fantasy','sf','nsf','popadancy','popadanec',
        'sf_postapocalyptic','adventure_fantasy','sf_industrial_magic',
        'sf_realrpg','russian_fantasy','slavic_fantasy','sf_su',
        'modern_tale','sf_social','sf_stimpank','dark_fantasy',
        'sf_technofantasy','sf_horror','utopia','sf_etc',
        'fantasy_det','sf_fantasy','hronoopera','sf_epic',
        'sf_humor','love_history','love_short','love_sf',
        'love','love_detective','love_hard','love_contemporary',
        'love_erotica','adventure','network_literature','adv_history',
        'nonf_biography','sf_magic'
    ],
    blockedGenres: ['det_lady']
};

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

        const seq = Array.isArray(info.sequence)
            ? info.sequence
            : [info.sequence];

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
 * TITLE
 * =========================
 */
function extractTitle(json, fallback) {
    return (
        json?.FictionBook?.description?.["title-info"]?.["book-title"]
        || fallback
    );
}

/**
 * =========================
 * FILTER ENGINE
 * =========================
 */
function shouldSkipImport({ authors, language, genres }) {

    if (IMPORT_RULES.allowedLanguages && !IMPORT_RULES.allowedLanguages.includes(language)) {
        return `language not allowed: ${language}`;
    }
    if (IMPORT_RULES.blockedLanguages?.includes(language)) {
        return `language blocked: ${language}`;
    }

    const authorNames = authors.map(a =>
        `${a.firstname} ${a.middlename || ""} ${a.lastname}`.replace(/\s+/g, " ").trim()
    );

    for (const a of authorNames) {
        if (IMPORT_RULES.blockedAuthors?.includes(a)) {
            return `author blocked: ${a}`;
        }
    }

    const badGenre = genres.find(g =>
        IMPORT_RULES.blockedGenres?.includes(g)
    );
    if (badGenre) {
        return `genre blocked: ${badGenre}`;
    }

    if (IMPORT_RULES.allowedGenres?.length) {
        const ok = genres.some(g =>
            IMPORT_RULES.allowedGenres.includes(g)
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
    const xml = readFileSmart(filePath);

    let json;

    try {
        json = parser.parse(xml);
    } catch {
        throw new Error("XML parse failed");
    }

    const authors = extractAuthors(json);
    if (!authors.length) {
        throw new Error("No authors in FB2");
    }

    const language = extractLanguage(json);
    const genres = extractGenres(json);
    const series = extractSeries(json);

    const title = extractTitle(json, path.basename(filePath));

    return {
        book: {
            book_id: crypto.randomBytes(12).toString("hex"),
            title,
            language,
            annotation: null,
            publication_date: null,
            hash: hashFile(buffer)
        },
        authors,
        genres,
        series
    };
}

/**
 * =========================
 * IMPORT MAIN
 * =========================
 */
function importBooks() {
    const files = getAllFiles();

    let imported = 0;
    let skipped = 0;
    let deleted = 0;

    const existing = new Set(
        BookModel.getAll().map(b => b.hash)
    );

    console.log(`Found ${files.length} files for importing...`);

    for (const file of files) {
        try {
            const parsed = parseBook(file);
            const book = parsed.book;

            // duplicate check
            if (existing.has(book.hash)) {
                skipped++;
                fs.unlinkSync(file);
                deleted++;

                console.log(`SKIPPED duplicate: ${book.title}`);
                continue;
            }

            // filter rules
            const reason = shouldSkipImport({
                authors: parsed.authors,
                language: book.language,
                genres: parsed.genres
            });

            if (reason) {
                skipped++;

                console.log(`SKIPPED (${reason}): ${book.title}`);
                continue;
            }

            // save book
            BookModel.create(book);
            existing.add(book.hash);
            imported++;

            console.log(`IMPORTED: ${book.title}`);

            if (parsed.authors.length > 0) {
                for (const a of parsed.authors) {
                    const author = AuthorModel.getOrCreate( a.firstname, a.middlename, a.lastname );
                    BookAuthorModel.link(book.book_id, author.author_id);
                    console.log( ` - AUTHOR: ${a.lastname}, ${a.firstname}${a.middlename ? " " + a.middlename : ""}` );
                }
            }

            if (parsed.genres.length > 0) {
                for (const g of parsed.genres) {
                    const genre = GenreModel.getOrCreate(g);
                    if (genre) { BookGenreModel.link(book.book_id, genre.genre_id); }
                    console.log(` - GENRE: ${g}`);
                }
            }
            
           if (parsed.series.length) {
               for (const s of parsed.series) {
                    const serie = SerieModel.getOrCreate(s.title);
                    BookSerieModel.link( book.book_id, serie.serie_id, s.number );
                    console.log(` - SERIES: ${s.title} (#${s.number || "?"})` );
                }
            }

            fs.unlinkSync(file);
            deleted++;

        } catch (e) {
            console.error(`FAILED: ${file} -> ${e.message}`);
        }
    }

    removeEmptyDirs();

    console.log(
        `DONE: \nimported=${imported}, \nskipped=${skipped}, \ndeleted=${deleted}`
    );

    return { imported, skipped, deleted };
}

module.exports = {
    importBooks
};