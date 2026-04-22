const db = require("../../core/db");
const { pagedQuery } = require("../../core/dbpagination");

class BookSerieModel {

    static getBooks(serie_id, bookModel, page = 1, limit = 20) {

        const result = pagedQuery({
            table: "BookSeries",
            select: "book_id",
            where: "serie_id = ?",
            params: [serie_id],
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

    static link(book_id, serie_id, serie_num = null) {
        return db.prepare(
            `INSERT OR IGNORE INTO BookSeries (book_id, serie_id, sequence_number) VALUES (?, ?, ?)`
        ).run(book_id, serie_id, serie_num);
    }

    static unlink(book_id, serie_id) {
        return db.prepare(
            `DELETE FROM BookSeries WHERE book_id = ? AND serie_id = ?`
        ).run(book_id, serie_id);
    }
}

module.exports = BookSerieModel;