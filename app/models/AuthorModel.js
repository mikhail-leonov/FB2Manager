const db = require("../../core/db");
const crypto = require("crypto");

class AuthorModel {
    static getAll(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        return db.prepare("SELECT * FROM Authors ORDER BY rowid DESC LIMIT ? OFFSET ?").all(limit, offset);
    }

    static getById(id) {
        return db.prepare("SELECT * FROM Authors WHERE author_id = ?").get(id);
    }

    static findByName(firstname, middlename, lastname) {
        return db.prepare(`SELECT * FROM Authors WHERE firstname = ? AND middlename IS ? AND lastname = ? `).get(firstname, middlename || null, lastname); 
    }

    static create(author) {
        const stmt = db.prepare(`INSERT INTO Authors (author_id, firstname, middlename, lastname) VALUES (?, ?, ?, ?)`);
        return stmt.run(author.author_id, author.firstname, author.middlename || null, author.lastname );
    }

    static getOrCreate(firstname, middlename, lastname) {
        const existing = this.findByName(firstname, middlename, lastname);
        if (existing) { return existing; }
        const author = { author_id: crypto.randomBytes(12).toString("hex"), firstname, middlename: middlename || null, lastname };
        this.create(author);
        return author;
    }

    static delete(id) {
        return db.prepare("DELETE FROM Authors WHERE author_id = ?").run(id);
    }
}

module.exports = AuthorModel;