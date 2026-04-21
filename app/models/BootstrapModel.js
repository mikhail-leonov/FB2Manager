const db = require("../../core/db");

const { ALL_TABLES } = require("../../core/constants");


class BootstrapModel {

    static hasFullSchema() {
        const rows = db.prepare(
            `SELECT name FROM sqlite_master WHERE type='table'`
        ).all();

        const existing = new Set(rows.map(r => r.name));
        return ALL_TABLES.every(t => existing.has(t));
    }

    static hasGenres() {
        return db.prepare(`SELECT COUNT(*) AS c FROM Genres`).get().c > 0;
    }

    static hasAuthors() {
        return db.prepare(`SELECT COUNT(*) AS c FROM Authors`).get().c > 0;
    }

    static hasBooks() {
        return db.prepare(`SELECT COUNT(*) AS c FROM Books`).get().c > 0;
    }
}

module.exports = BootstrapModel;