const db = require("../../core/db");
const { pagedQuery } = require("../../core/dbpagination");

// =============================
// PRECOMPILED STATEMENTS
// =============================

const linkStmt = db.prepare(`INSERT OR IGNORE INTO BookGenres (book_id, genre_id) VALUES (?, ?)`);
const unlinkStmt = db.prepare(`DELETE FROM BookGenres WHERE book_id = ? AND genre_id = ?`);

// =============================
// MODEL
// =============================

class BookGenreModel {

    static getBooks(genre_id, bookModel, page = 1, limit = 20) {
        const result = pagedQuery({ table: "BookGenres", select: "book_id", where: "genre_id = ?", params: [genre_id], page, limit, orderBy: "rowid DESC" });
        const ids = result.data.map(r => r.book_id);
        return { data: bookModel.getByIds(ids), pagination: result.pagination };
    }

    static link(book_id, genre_id) {
        return linkStmt.run(book_id, genre_id);
    }

    static unlink(book_id, genre_id) {
        return unlinkStmt.run(book_id, genre_id);
    }
}

module.exports = BookGenreModel;