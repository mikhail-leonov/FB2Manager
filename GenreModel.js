const db = require("../../core/db");

class BookAuthorModel {
    link(book_id, author_id) {
        return db.prepare(`INSERT OR IGNORE INTO BookAuthors (book_id, author_id) VALUES (?, ?)`).run(book_id, author_id);
    }
    unlink(book_id, author_id) {
        return db.prepare(`DELETE FROM BookAuthors WHERE book_id = ? AND author_id = ?`).run(book_id, author_id);
    }
}

module.exports = new BookAuthorModel();