// =============================
// Constants
// =============================

const db = require("../../core/db");
const { BOOKS_PER_PAGE } = require("../../core/constants");
const { pagedQuery } = require("../../core/dbpagination");

// =============================
// PRECOMPILED STATEMENTS
// =============================

const linkStmt = db.prepare(`INSERT OR IGNORE INTO BookAuthors (book_id, author_id) VALUES (?, ?)`);
const unlinkStmt = db.prepare(`DELETE FROM BookAuthors WHERE book_id = ? AND author_id = ?`);

// =============================
// MODEL
// =============================

class BookAuthorModel {

    static getBooks(author_id, bookModel, page = 1, limit = BOOKS_PER_PAGE) {
        const result = pagedQuery({ table: "BookAuthors", select: "book_id", where: "author_id = ?", params: [author_id], page, limit, orderBy: "rowid DESC" });
        const ids = result.data.map(r => r.book_id);
        return { data: bookModel.getByIds(ids), pagination: result.pagination };
    }

    static link(book_id, author_id) {
        return linkStmt.run(book_id, author_id);
    }

    static unlink(book_id, author_id) {
        return unlinkStmt.run(book_id, author_id);
    }
}

module.exports = BookAuthorModel;