const db = require("../../core/db");
const crypto = require("crypto");
const { pagedQuery } = require("../../core/dbpagination");
const { BOOKS_PER_PAGE, ALL_COLUMNS } = require("../../core/constants");

class AuthorModel {
    static getAll(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") ?? BOOKS_PER_PAGE, 10);
        const sortBy = url.searchParams.get("sort") || "rowid";
        const sortOrder = url.searchParams.get("order") || "DESC";
        const validSortBy = ALL_COLUMNS.includes(sortBy) ? sortBy : "rowid";
        const validOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
        const orderBy = `${validSortBy} ${validOrder}`;

	return pagedQuery({ table: "Authors", page, limit, orderBy });
    }
    static getById(id) {
        return db.prepare("SELECT * FROM Authors WHERE author_id = ?").get(id);
    }
    static findByName(firstname, middlename, lastname) {
        return db.prepare(`SELECT * FROM Authors WHERE firstname = ? AND middlename IS ? AND lastname = ? `).get(firstname, middlename || null, lastname);
    }
    static getOrCreate(firstname, middlename, lastname) {
        const existing = this.findByName(firstname, middlename, lastname);
        if (existing) return existing;
        const author = {
            author_id: crypto.randomBytes(12).toString("hex"),
            firstname,
            middlename: middlename || null,
            lastname
        };
        this.create(author);
        return author;
    }
    static create(author) {
        const stmt = db.prepare(`INSERT INTO Authors (author_id, firstname, middlename, lastname) VALUES (?, ?, ?, ?)`);
        return stmt.run( author.author_id, author.firstname, author.middlename || null, author.lastname );
    }
    static delete(id) {
        return db.prepare("DELETE FROM Authors WHERE author_id = ?").run(id);
    }
}

module.exports = AuthorModel;