const fs = require("fs");
const path = require("path");
const db = require("./db");

const BootstrapModel = require("../app/models/BootstrapModel");

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

function ensureFolders() {
    [SQL_DIR, DB_DIR, BACKUP_DIR, FILES_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created folder: ${dir}`);
        }
    });
}

function bootstrapDatabase() {
    ensureFolders();

    if (fs.existsSync(SCHEMA_PATH) && !BootstrapModel.hasFullSchema()) {
        console.log("Initializing schema...");
        db.exec(fs.readFileSync(SCHEMA_PATH, "utf-8"));
    }

    if (fs.existsSync(GENRES_SEED_PATH) && !BootstrapModel.hasGenres()) {
        console.log("Adding genres data...");
        db.exec(fs.readFileSync(GENRES_SEED_PATH, "utf-8"));
    }

    if (fs.existsSync(BOOKS_SEED_PATH) && !BootstrapModel.hasBooks()) {
        console.log("Adding books data...");
        db.exec(fs.readFileSync(BOOKS_SEED_PATH, "utf-8"));
    }

    if (fs.existsSync(AUTHORS_SEED_PATH) && !BootstrapModel.hasAuthors()) {
        console.log("Adding authors data...");
        db.exec(fs.readFileSync(AUTHORS_SEED_PATH, "utf-8"));
    }
}

module.exports = { bootstrapDatabase };