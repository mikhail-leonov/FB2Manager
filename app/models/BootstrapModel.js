const db = require("../../core/db");

const REQUIRED_TABLES = [
    "Books", "Authors", "Genres", "Series",
    "BookAuthors", "BookGenres", "BookSeries"
];

class BootstrapModel {

    hasFullSchema() {
        const rows = db.prepare(
            `SELECT name FROM sqlite_master WHERE type='table'`
        ).all();

        const existing = new Set(rows.map(r => r.name));
        return REQUIRED_TABLES.every(t => existing.has(t));
    }

    hasGenres() {
        return db.prepare(`SELECT COUNT(*) AS c FROM Genres`).get().c > 0;
    }

    hasAuthors() {
        return db.prepare(`SELECT COUNT(*) AS c FROM Authors`).get().c > 0;
    }

    hasBooks() {
        return db.prepare(`SELECT COUNT(*) AS c FROM Books`).get().c > 0;
    }
}

module.exports = new BootstrapModel();