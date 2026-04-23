const db = require("../../core/db");
const { preprocess } = require("../services/TextPreprocessor");

class BooksFTSModel {

    static insert(book) {
        const title = preprocess(book.title);
        const annotation = preprocess(book.annotation);

        db.prepare(`
            INSERT INTO BooksFTS (rowid, title, annotation)
            VALUES (?, ?, ?)
        `).run(book.book_id, title, annotation);
    }

    static update(book) {
        const title = preprocess(book.title);
        const annotation = preprocess(book.annotation);

        db.prepare(`
            DELETE FROM BooksFTS WHERE rowid = ?
        `).run(book.book_id);

        db.prepare(`
            INSERT INTO BooksFTS (rowid, title, annotation)
            VALUES (?, ?, ?)
        `).run(book.book_id, title, annotation);
    }

    static remove(bookId) {
        db.prepare(`
            DELETE FROM BooksFTS WHERE rowid = ?
        `).run(bookId);
    }

    static rebuildFromBooks(books) {
        const insert = db.prepare(`
            INSERT INTO BooksFTS (rowid, title, annotation)
            VALUES (?, ?, ?)
        `);

        const deleteAll = db.prepare(`DELETE FROM BooksFTS`);

        deleteAll.run();

        const tx = db.transaction((list) => {
            for (const book of list) {
                insert.run(
                    book.book_id,
                    preprocess(book.title),
                    preprocess(book.annotation)
                );
            }
        });

        tx(books);
    }
}

module.exports = BooksFTSModel;