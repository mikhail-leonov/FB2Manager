const fs = require("fs");
const path = require("path");
const db = require("./db");

const ROOT = path.join(__dirname, "..");

// Folders
const SQL_DIR = path.join(ROOT, "sql");
const DB_DIR = path.join(ROOT, "db");
const BACKUP_DIR = path.join(ROOT, "backup");
const FILES_DIR = path.join(ROOT, "files");

// SQL files
const SCHEMA_PATH = path.join(SQL_DIR, "db.sql");
const GENRES_SEED_PATH = path.join(SQL_DIR, "genres.sql");
const BOOKS_SEED_PATH = path.join(SQL_DIR, "books.sql");
const AUTHORS_SEED_PATH = path.join(SQL_DIR, "authors.sql");

const REQUIRED_TABLES = [
    "Books", "Authors", "Genres", "Series",
    "BookAuthors", "BookGenres", "BookSeries"
];

function ensureFolders() {
    [SQL_DIR, DB_DIR, BACKUP_DIR, FILES_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created folder: ${dir}`);
        }
    });
}

function hasFullSchema() {
    const rows = db.prepare(
        `SELECT name FROM sqlite_master WHERE type='table'`
    ).all();

    const existing = new Set(rows.map(r => r.name));
    return REQUIRED_TABLES.every(t => existing.has(t));
}

function hasGenres() {
    return db.prepare(`SELECT COUNT(*) AS c FROM Genres`).get().c > 0;
}

function hasAuthors() {
    return db.prepare(`SELECT COUNT(*) AS c FROM Authors`).get().c > 0;
}

function hasBooks() {
    return db.prepare(`SELECT COUNT(*) AS c FROM Books`).get().c > 0;
}

function bootstrapDatabase() {
    // Ensure folder structure exists first
    ensureFolders();

    if (fs.existsSync(SCHEMA_PATH) && !hasFullSchema()) {
        console.log("Initializing schema...");
        db.exec(fs.readFileSync(SCHEMA_PATH, "utf-8"));
    }

    if (fs.existsSync(GENRES_SEED_PATH) && !hasGenres()) {
        console.log("Adding genres data...");
        db.exec(fs.readFileSync(GENRES_SEED_PATH, "utf-8"));
    }

    if (fs.existsSync(BOOKS_SEED_PATH) && !hasBooks()) {
        console.log("Adding books data...");
        db.exec(fs.readFileSync(BOOKS_SEED_PATH, "utf-8"));
    }

    if (fs.existsSync(AUTHORS_SEED_PATH) && !hasAuthors()) {
        console.log("Adding authors data...");
        db.exec(fs.readFileSync(AUTHORS_SEED_PATH, "utf-8"));
    }
}

module.exports = { bootstrapDatabase };