const db = require("../../core/db");

class BookSerieModel {
    static getBooks(serie_id, bookModel) { 
        const rows = db.prepare(`SELECT book_id FROM BookSeries WHERE serie_id = ?`).all(serie_id);
        const ids = rows.map(r => r.book_id);
        return bookModel.getByIds(ids);
    }    
    static link(book_id, serie_id, serie_num = null) {
        return db.prepare(`INSERT OR IGNORE INTO BookSeries (book_id, serie_id, sequence_number) VALUES (?, ?, ?)`).run(book_id, serie_id, serie_num);
    }
    static unlink(book_id, serie_id) {
        return db.prepare(`DELETE FROM BookSeries WHERE book_id = ? AND serie_id = ?`).run(book_id, serie_id);
    }
}

module.exports = BookSerieModel;