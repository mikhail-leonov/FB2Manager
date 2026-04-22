const db = require("../../core/db");
const { pagedQuery } = require("../../core/dbpagination");

class BookAuthorModel {

    static getBooks(author_id, bookModel, page = 1, limit = 20) {

        const result = pagedQuery({
            table: "BookAuthors",
            select: "book_id",
            where: "author_id = ?",
            params: [author_id],
            page,
            limit,
            orderBy: "rowid DESC"
        });

        const ids = result.data.map(r => r.book_id);

        return {
            data: bookModel.getByIds(ids),
            pagination: result.pagination
        };
    }

    static link(book_id, author_id) {
        return db.prepare(
            `INSERT OR IGNORE INTO BookAuthors (book_id, author_id) VALUES (?, ?)`
        ).run(book_id, author_id);
    }

    static unlink(book_id, author_id) {
        return db.prepare(
            `DELETE FROM BookAuthors WHERE book_id = ? AND author_id = ?`
        ).run(book_id, author_id);
    }
}

module.exports = BookAuthorModel;