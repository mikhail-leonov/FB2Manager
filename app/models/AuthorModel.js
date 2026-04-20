const db = require("../../core/db");
const crypto = require("crypto");

class AuthorModel {
    getAll() {
        return db.prepare("SELECT * FROM Authors").all();
    }

    getById(id) {
        return db.prepare("SELECT * FROM Authors WHERE author_id = ?").get(id);
    }

    findByName(firstname, middlename, lastname) {
        return db.prepare(`SELECT * FROM Authors WHERE firstname = ? AND middlename IS ? AND lastname = ? `).get(firstname, middlename || null, lastname); 
    }

    create(author) {
        const stmt = db.prepare(`INSERT INTO Authors (author_id, firstname, middlename, lastname) VALUES (?, ?, ?, ?)`);
        return stmt.run(author.author_id, author.firstname, author.middlename || null, author.lastname );
    }

    getOrCreate(firstname, middlename, lastname) {
        const existing = this.findByName(firstname, middlename, lastname);
        if (existing) { return existing; }
        const author = { author_id: crypto.randomBytes(12).toString("hex"), firstname, middlename: middlename || null, lastname };
        this.create(author);
        return author;
    }

    delete(id) {
        return db.prepare("DELETE FROM Authors WHERE author_id = ?").run(id);
    }
}

module.exports = new AuthorModel();