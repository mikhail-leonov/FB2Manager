const db = require("../../core/db");

class BookGenreModel {
    link(book_id, genre_id) {
        return db.prepare(`INSERT OR IGNORE INTO BookGenres (book_id, genre_id) VALUES (?, ?)`).run(book_id, genre_id);
    }
    unlink(book_id, genre_id) {
        return db.prepare(`DELETE FROM BookGenres WHERE book_id = ? AND genre_id = ?`).run(book_id, genre_id);
    }
}

module.exports = new BookGenreModel();