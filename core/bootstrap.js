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
    JS_DIR,
    CSS_DIR,
    LOG_DIR,
    LOG_FILE,
    SCHEMA_FILE,
    GENRES_SEED_FILE,
    BOOKS_SEED_FILE,
    AUTHORS_SEED_FILE
} = require("./constants");

function countInsertStatements(filePath) {
    const sql = fs.readFileSync(filePath, "utf8");
    const matches = sql.match(/INSERT\s+(OR\s+\w+\s+)?INTO/gi);
    return matches ? matches.length : 0;
}

function ensureFolders() {
    [SQL_DIR, CSS_DIR, JS_DIR, LOG_DIR, UPLOAD_DIR, DB_DIR, BACKUP_DIR, FILES_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created folder: ${dir}`);
        }
    });
}

function getTimestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const Y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h = pad(d.getHours());
    const min = pad(d.getMinutes());
    const s = pad(d.getSeconds());
    return `${Y}-${m}-${day}-${h}-${min}-${s}`;
}

function backupLogFile() {
    if (!fs.existsSync(LOG_FILE)) return;

    const timestamp = getTimestamp();
    const ext = path.extname(LOG_FILE);
    const base = path.basename(LOG_FILE, ext);
    const dir = path.dirname(LOG_FILE);

    const backupName = `${base}.${timestamp}${ext}`;
    const backupPath = path.join(dir, backupName);

    fs.copyFileSync(LOG_FILE, backupPath);
    console.log(`Log backed up: ${backupPath}`);
}

function bootstrapDatabase() {
    ensureFolders();


    if (fs.existsSync(LOG_FILE)) {
        backupLogFile();

        fs.writeFileSync(LOG_FILE, "");
        console.log(`Log file cleared: ${LOG_FILE}`);
    }

    if (fs.existsSync(SCHEMA_FILE) && !BootstrapModel.hasFullSchema()) {
        console.log("Initializing schema...");
        db.exec(fs.readFileSync(SCHEMA_FILE, "utf-8"));
    }

    if (fs.existsSync(AUTHORS_SEED_FILE) && !BootstrapModel.hasAuthors()) {
        const n = countInsertStatements(AUTHORS_SEED_FILE);
        console.log(`Adding ${n} author(s)...`);
        db.exec(fs.readFileSync(AUTHORS_SEED_FILE, "utf-8"));
    }

    if (fs.existsSync(BOOKS_SEED_FILE) && !BootstrapModel.hasBooks()) {
        const n = countInsertStatements(BOOKS_SEED_FILE);
        console.log(`Adding ${n} book(s)...`);
        db.exec(fs.readFileSync(BOOKS_SEED_FILE, "utf-8"));
    }

    if (fs.existsSync(GENRES_SEED_FILE) && !BootstrapModel.hasGenres()) {
        const n = countInsertStatements(GENRES_SEED_FILE);
        console.log(`Adding ${n} genre(s)...`);
        db.exec(fs.readFileSync(GENRES_SEED_FILE, "utf-8"));
    }
}

module.exports = { bootstrapDatabase };