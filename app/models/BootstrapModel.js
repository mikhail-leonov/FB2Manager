const db = require("../../core/db");
const { ALL_TABLES } = require("../../core/constants");

// ======================
// PRECOMPILED STATEMENTS
// ======================

const getTablesStmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`);
const countGenresStmt = db.prepare(`SELECT COUNT(*) AS c FROM Genres`);
const countAuthorsStmt = db.prepare(`SELECT COUNT(*) AS c FROM Authors`);
const countBooksStmt = db.prepare(`SELECT COUNT(*) AS c FROM Books`);

// ======================
// MODEL
// ======================

class BootstrapModel {

    static hasFullSchema() {
        const rows = getTablesStmt.all();
        const existing = new Set(rows.map(r => r.name));
        return ALL_TABLES.every(t => existing.has(t));
    }

    static hasGenres() {
        return countGenresStmt.get().c > 0;
    }

    static hasAuthors() {
        return countAuthorsStmt.get().c > 0;
    }

    static hasBooks() {
        return countBooksStmt.get().c > 0;
    }
}

module.exports = BootstrapModel;