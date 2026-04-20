const fs = require("fs");
const path = require("path");
const db = require("./db");

const ROOT = path.join(__dirname, "..");

const SCHEMA_PATH = path.join(ROOT, "sql", "db.sql");

const GENRES_SEED_PATH = path.join(ROOT, "sql", "genres.sql");
const BOOKS_SEED_PATH = path.join(ROOT, "sql", "books.sql");
const AUTHORS_SEED_PATH = path.join(ROOT, "sql", "authors.sql");

const REQUIRED_TABLES = [
    "Books", "Authors", "Genres", "Series",
    "BookAuthors", "BookGenres", "BookSeries"
];

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