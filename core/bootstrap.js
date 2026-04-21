const fs = require("fs");
const path = require("path");
const db = require("./db");

const BootstrapModel = require("../app/models/BootstrapModel");

const {
    SQL_DIR,
    DB_DIR,
    BACKUP_DIR,
    FILES_DIR,
    UPLOAD_DIR,
    SCHEMA_FILE,
    GENRES_SEED_FILE,
    BOOKS_SEED_FILE,
    AUTHORS_SEED_FILE
} = require("./constants");

function ensureFolders() {
    [SQL_DIR, UPLOAD_DIR, DB_DIR, BACKUP_DIR, FILES_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created folder: ${dir}`);
        }
    });
}

function bootstrapDatabase() {
    ensureFolders();

    if (fs.existsSync(SCHEMA_FILE) && !BootstrapModel.hasFullSchema()) {
        console.log("Initializing schema...");
        db.exec(fs.readFileSync(SCHEMA_FILE, "utf-8"));
    }

    if (fs.existsSync(GENRES_SEED_FILE) && !BootstrapModel.hasGenres()) {
        console.log("Adding genres data...");
        db.exec(fs.readFileSync(GENRES_SEED_FILE, "utf-8"));
    }

    if (fs.existsSync(BOOKS_SEED_FILE) && !BootstrapModel.hasBooks()) {
        console.log("Adding books data...");
        db.exec(fs.readFileSync(BOOKS_SEED_FILE, "utf-8"));
    }

    if (fs.existsSync(AUTHORS_SEED_FILE) && !BootstrapModel.hasAuthors()) {
        console.log("Adding authors data...");
        db.exec(fs.readFileSync(AUTHORS_SEED_FILE, "utf-8"));
    }
}

module.exports = { bootstrapDatabase };