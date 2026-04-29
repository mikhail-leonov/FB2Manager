const db = require("../../core/db");
const crypto = require("crypto");
const { pagedQuery } = require("../../core/dbpagination");
const { BOOKS_PER_PAGE, ALL_COLUMNS } = require("../../core/constants");

// ======================
// PRECOMPILED STATEMENTS
// ======================

const getByIdStmt = db.prepare(`SELECT * FROM Genres WHERE genre_id = ?`);
const findByTitleStmt = db.prepare(`SELECT * FROM Genres WHERE title = ?`);
const insertStmt = db.prepare(`INSERT INTO Genres (genre_id, title) VALUES (?, ?)`);
const deleteStmt = db.prepare(`DELETE FROM Genres WHERE genre_id = ?`);

// ======================
// MODEL
// ======================

class GenreModel {

    static getAll(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") ?? BOOKS_PER_PAGE, 10);
        const sortBy = url.searchParams.get("sort") || "rowid";
        const sortOrder = url.searchParams.get("order") || "DESC";
        const validSortBy = ALL_COLUMNS.includes(sortBy) ? sortBy : "rowid";
        const validOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
        const orderBy = `${validSortBy} ${validOrder}`;
        return pagedQuery({ table: "Genres", page, limit, orderBy });
    }

    static getById(id) {
        return getByIdStmt.get(id);
    }

    static findByTitle(title) {
        return findByTitleStmt.get(title);
    }

    static getOrCreate(title) {
        if (!title) return null;
        const existing = findByTitleStmt.get(title);
        if (existing) return existing;
        const genre = { genre_id: crypto.randomBytes(12).toString("hex"), title };
        insertStmt.run(genre.genre_id, genre.title);
        return genre;
    }

    static create(genre) {
        return insertStmt.run(genre.genre_id, genre.title);
    }

    static delete(id) {
        return deleteStmt.run(id);
    }
}

module.exports = GenreModel;