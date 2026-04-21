const db = require("../../core/db");

class BookGenreModel {
    static getBooks(genre_id, bookModel, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const rows = db.prepare(`SELECT book_id FROM BookGenres WHERE genre_id = ? ORDER BY rowid DESC LIMIT ? OFFSET ?`).all(genre_id, limit, offset);
        const ids = rows.map(r => r.book_id);
        return bookModel.getByIds(ids);
    }    
    static link(book_id, genre_id) {
        return db.prepare(`INSERT OR IGNORE INTO BookGenres (book_id, genre_id) VALUES (?, ?)`).run(book_id, genre_id);
    }
    static unlink(book_id, genre_id) {
        return db.prepare(`DELETE FROM BookGenres WHERE book_id = ? AND genre_id = ?`).run(book_id, genre_id);
    }
}

module.exports = BookGenreModel;