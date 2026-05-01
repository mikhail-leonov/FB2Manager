// =============================
// Constants
// =============================

const db = require("../../core/db");
const { preprocess } = require("../services/TextPreprocessor");

// ======================
// PRECOMPILED STATEMENTS
// ======================

const insertStmt = db.prepare(`INSERT INTO BooksFTS (rowid, title, annotation) VALUES (?, ?, ?)`);
const deleteStmt = db.prepare(`DELETE FROM BooksFTS WHERE rowid = ?`);
const deleteAllStmt = db.prepare(`DELETE FROM BooksFTS`);

// ======================
// TRANSACTION (REBUILD)
// ======================

const rebuildTx = db.transaction((books) => {
    for (const book of books) { insertStmt.run( book.book_id, preprocess(book.title), preprocess(book.annotation) ); }
});

// ======================
// MODEL
// ======================

class BooksFTSModel {

    static insert(book) {
        const title = preprocess(book.title);
        const annotation = preprocess(book.annotation);
        return insertStmt.run( book.rowid, title, annotation );
    }

    static update(book) {
        this.remove(book.book_id);
        this.insert(book);
    }

    static remove(bookId) {
        return deleteStmt.run(bookId);
    }

    static removeAll() {
        return deleteAllStmt.run();
    }

    static rebuildFromBooks(books) {
        this.removeAll();
        rebuildTx(books);
    }
}

module.exports = BooksFTSModel;