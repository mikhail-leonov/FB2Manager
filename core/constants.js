// =========================
// CORE CONSTANTS (GLOBAL)
// =========================

const path = require("path");

// ROOT
const ROOT = path.join(__dirname, "..");

// DIRECTORIES
const DB_DIR      = path.join(ROOT, "db");
const SQL_DIR     = path.join(ROOT, "sql");
const BACKUP_DIR  = path.join(ROOT, "backup");
const FILES_DIR   = path.join(ROOT, "files");
const UPLOAD_DIR  = path.join(ROOT, "upload");
const VIEWS_DIR   = path.join(ROOT, "views");
const LOG_DIR     = path.join(ROOT, "logs");


// FILES
const DB_FILE            = path.join(DB_DIR, "books.db");
const SCHEMA_FILE        = path.join(SQL_DIR, "db.sql");
const GENRES_SEED_FILE   = path.join(SQL_DIR, "genres.sql");
const BOOKS_SEED_FILE    = path.join(SQL_DIR, "books.sql");
const AUTHORS_SEED_FILE  = path.join(SQL_DIR, "authors.sql");
const LOG_FILE           = path.join(LOG_DIR, "logs.log");

const ENCODING_MAP = {
    "utf8": "utf-8",
    "utf-8": "utf-8",
    "utf 8": "utf-8",
    "cp1251": "windows-1251",
    "windows-1251": "windows-1251",
    "win1251": "windows-1251",
    "windows-1252": "windows-1252",
    "cp1252": "windows-1252",
    "latin1": "windows-1252",
    "iso-8859-1": "windows-1252",
    "iso-8859-2": "iso-8859-2",
    "latin2": "iso-8859-2",
    "cp1250": "windows-1250",
    "windows-1250": "windows-1250",
    "koi8-r": "koi8-r",
    "koi8r": "koi8-r",
    "koi8-u": "koi8-u",
    "ibm866": "ibm866",
    "cp866": "ibm866",
    "866": "ibm866",
    "shift_jis": "shift_jis",
    "shift-jis": "shift_jis",
    "sjis": "shift_jis",
    "euc-kr": "euc-kr",
    "euckr": "euc-kr",
    "gbk": "gbk",
    "gb2312": "gb2312",
    "ascii": "utf-8"
};
// TABLES
const TABLE_BOOKS        = "Books";
const TABLE_AUTHORS      = "Authors";
const TABLE_GENRES       = "Genres";
const TABLE_SERIES       = "Series";
const TABLE_BOOK_AUTHORS = "BookAuthors";
const TABLE_BOOK_GENRES  = "BookGenres";
const TABLE_BOOK_SERIES  = "BookSeries";

const ALL_TABLES = [
    TABLE_BOOKS,
    TABLE_AUTHORS,
    TABLE_GENRES,
    TABLE_SERIES,
    TABLE_BOOK_AUTHORS,
    TABLE_BOOK_GENRES,
    TABLE_BOOK_SERIES
];

// HTTP
const CONTENT_TYPE_JSON = "application/json";
const CONTENT_TYPE_JS   = "application/javascript";
const CONTENT_TYPE_HTML = "text/html; charset=utf-8";

// ROUTES / STATIC
const JS_PREFIX = "/js/";
const FILES_PREFIX = "/files/";

// FILE TYPES
const FB2_EXTENSION = ".fb2";


// IMPORT RULES
const IMPORT_ALLOWED_LANGUAGES = ["en", "ru"];
const IMPORT_BLOCKED_LANGUAGES = null;

const IMPORT_BLOCKED_ENCODINGS = null; // or null to disable
const IMPORT_ALLOWED_ENCODINGS = ["utf-8", "win1251"]; // e.g. 

const IMPORT_BLOCKED_AUTHORS = ["Some Author"];

const IMPORT_ALLOWED_GENRES = [
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
];
const IMPORT_BLOCKED_GENRES = ['det_lady'];

module.exports = {
    ROOT,

    DB_DIR,
    SQL_DIR,
    BACKUP_DIR,
    FILES_DIR,
    UPLOAD_DIR,
    VIEWS_DIR,
    LOG_DIR,

    DB_FILE,
    SCHEMA_FILE,
    GENRES_SEED_FILE,
    BOOKS_SEED_FILE,
    AUTHORS_SEED_FILE,
    LOG_FILE,

    CONTENT_TYPE_JSON, 
    CONTENT_TYPE_JS, 
    CONTENT_TYPE_HTML,
    JS_PREFIX,
    FILES_PREFIX,
    FB2_EXTENSION,

    TABLE_BOOKS,
    TABLE_AUTHORS,
    TABLE_GENRES,
    TABLE_SERIES,
    TABLE_BOOK_AUTHORS,
    TABLE_BOOK_GENRES,
    TABLE_BOOK_SERIES,
    ALL_TABLES,

    ENCODING_MAP,

    IMPORT_BLOCKED_ENCODINGS, 
    IMPORT_ALLOWED_ENCODINGS,
    IMPORT_ALLOWED_LANGUAGES,
    IMPORT_BLOCKED_LANGUAGES,
    IMPORT_BLOCKED_AUTHORS,
    IMPORT_ALLOWED_GENRES,
    IMPORT_BLOCKED_GENRES
};