const db = require("../../core/db");
const { preprocess } = require("../services/TextPreprocessor");

class BooksFTSModel {

    static insert(book) {
        const title = preprocess(book.title);
        const annotation = preprocess(book.annotation);
        db.prepare(`INSERT INTO BooksFTS (rowid, title, annotation) VALUES (?, ?, ?) `).run(book.rowid, title, annotation);
    }
    static update(book) {
        this.remove(book.book_id);  
        this.insert(book);
    }
    static remove(bookId) {
        db.prepare(`DELETE FROM BooksFTS WHERE rowid = ?`).run(bookId);
    }
    static removeAll() {
        db.prepare(`DELETE FROM BooksFTS`).run();
    }
    static rebuildFromBooks(books) {
        this.removeAll();
        const insert = db.prepare(`INSERT INTO BooksFTS (rowid, title, annotation) VALUES (?, ?, ?) `);
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