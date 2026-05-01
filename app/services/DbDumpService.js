// =============================
// Constants
// =============================

const db = require("../../core/db");
const { ALL_TABLES } = require("../../core/constants");

// =============================
// Service
// =============================

function dumpDb() {
    const result = {};

    for (const table of ALL_TABLES) {
        try {
            result[table] = db.prepare(`SELECT * FROM ${table}`).all();
        } catch (e) {
            result[table] = { error: e.message };
        }
    }

    return result;
}

function dumpTable(table) {
    if (!ALL_TABLES.includes(table)) {
        throw new Error("Invalid table");
    }

    return db.prepare(`SELECT * FROM ${table}`).all();
}

function stats() {
    const result = {};

    for (const table of ALL_TABLES) {
        try {
            const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
            result[table] = row.count;
        } catch (e) {
            result[table] = null;
        }
    }

    return result;
}

function schema() {
    return db.prepare(`
        SELECT name, type, sql
        FROM sqlite_master
        WHERE type IN ('table','index')
        ORDER BY type, name
    `).all();
}

function cleanDb() {
    const trx = db.transaction(() => {
        db.prepare("DELETE FROM BookAuthors").run();
        db.prepare("DELETE FROM BookGenres").run();
        db.prepare("DELETE FROM BookSeries").run();

        db.prepare("DELETE FROM Authors").run();
        db.prepare("DELETE FROM Series").run();
        db.prepare("DELETE FROM Genres").run();

        db.prepare("DELETE FROM Books").run();
    });

    trx();

    return { cleaned: true };
}

module.exports = {
    dumpDb,
    dumpTable,
    stats,
    schema,
    cleanDb
};