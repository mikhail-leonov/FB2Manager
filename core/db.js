const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const { DB_FILE } = require("./constants");

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const db = new Database(DB_FILE);
db.pragma("foreign_keys = ON");

module.exports = db;