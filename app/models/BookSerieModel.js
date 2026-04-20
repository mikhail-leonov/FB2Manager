const db = require("../../core/db");

class BookSerieModel {
    link(book_id, serie_id, serie_num = null) {
        return db.prepare(`INSERT OR IGNORE INTO BookSeries (book_id, serie_id, sequence_number) VALUES (?, ?, ?)`).run(book_id, serie_id, serie_num);
    }
    unlink(book_id, serie_id) {
        return db.prepare(`DELETE FROM BookSeries WHERE book_id = ? AND serie_id = ?`).run(book_id, serie_id);
    }
}

module.exports = new BookSerieModel();