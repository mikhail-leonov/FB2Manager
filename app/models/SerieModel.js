// =============================
// Constants
// =============================

const db = require("../../core/db");
const crypto = require("crypto");
const { pagedQuery } = require("../../core/dbpagination");
const { BOOKS_PER_PAGE, ALL_COLUMNS } = require("../../core/constants");

// ======================
// PRECOMPILED STATEMENTS
// ======================

const getByIdStmt = db.prepare(`SELECT * FROM Series WHERE serie_id = ?`);
const findByTitleStmt = db.prepare(`SELECT * FROM Series WHERE title = ?`);
const insertStmt = db.prepare(`INSERT INTO Series (serie_id, title) VALUES (?, ?)`);
const deleteStmt = db.prepare(`DELETE FROM Series WHERE serie_id = ?`);

// ======================
// MODEL
// ======================

class SerieModel {

    static getAll(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") ?? BOOKS_PER_PAGE, 10);
        const sortBy = url.searchParams.get("sort") || "rowid";
        const sortOrder = url.searchParams.get("order") || "DESC";
        const validSortBy = ALL_COLUMNS.includes(sortBy) ? sortBy : "rowid";
        const validOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
        const orderBy = `${validSortBy} ${validOrder}`;
        return pagedQuery({ table: "Series", page, limit, orderBy });
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
        const serie = { serie_id: crypto.randomBytes(12).toString("hex"), title };
        insertStmt.run(serie.serie_id, serie.title);
        return serie;
    }

    static create(serie) {
        return insertStmt.run(serie.serie_id, serie.title);
    }

    static delete(id) {
        return deleteStmt.run(id);
    }
}

module.exports = SerieModel;