const db = require("../../core/db");
const crypto = require("crypto");

class SerieModel {

    static getAll(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        return db.prepare("SELECT * FROM Series ORDER BY rowid DESC LIMIT ? OFFSET ?").all(limit, offset);
    }

    static getById(id) {
        return db.prepare(`SELECT * FROM Series WHERE serie_id = ?`).get(id);
    }

    static findByTitle(title) {
        return db.prepare(`SELECT * FROM Series WHERE title = ?`).get(title);
    }

    static create(serie) {
        const stmt = db.prepare(`INSERT INTO Series (serie_id, title) VALUES (?, ?)`);
        return stmt.run( serie.serie_id, serie.title );
    }

    static getOrCreate(title) {
        if (!title) { return null; }
        const existing = this.findByTitle(title);
        if (existing) { return existing; }
        const serie = { serie_id: crypto.randomBytes(12).toString("hex"), title };
        this.create(serie);
        return serie;
    }

    static delete(id) {
        return db.prepare(`DELETE FROM Series WHERE serie_id = ?`).run(id);
    }
}

module.exports = SerieModel;