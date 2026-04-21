const db = require("../../core/db");

class BookAuthorModel {
    static getBooks(author_id, bookModel, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const rows = db.prepare(`SELECT book_id FROM BookAuthors WHERE author_id = ? ORDER BY rowid DESC LIMIT ? OFFSET ?`).all(author_id, limit, offset);
        const ids = rows.map(r => r.book_id);
        return bookModel.getByIds(ids);
    }
    static link(book_id, author_id) {
        return db.prepare(`INSERT OR IGNORE INTO BookAuthors (book_id, author_id) VALUES (?, ?)`).run(book_id, author_id);
    }
    static unlink(book_id, author_id) {
        return db.prepare(`DELETE FROM BookAuthors WHERE book_id = ? AND author_id = ?`).run(book_id, author_id);
    }
}

module.exports = BookAuthorModel;