// =============================
// Constants
// =============================

const db = require("../../core/db");
const { preprocess } = require("../services/TextPreprocessor");

// =============================
// Service
// =============================

function insertBook(book) {
  const { title, annotation } = book;

  const titleFTS = preprocess(title);
  const annotationFTS = preprocess(annotation);

  const insertMain = db.prepare(`
    INSERT INTO books (title, annotation)
    VALUES (?, ?)
  `);

  const result = insertMain.run(title, annotation);

  const insertFTS = db.prepare(`
    INSERT INTO books_fts (rowid, title, annotation)
    VALUES (?, ?, ?)
  `);

  insertFTS.run(
    result.lastInsertRowid,
    titleFTS,
    annotationFTS
  );
}

/**
 * Optional: update book
 */
function updateBook(id, book) {
  const { title, annotation } = book;

  const titleFTS = preprocess(title);
  const annotationFTS = preprocess(annotation);

  db.prepare(`
    UPDATE books
    SET title = ?, annotation = ?
    WHERE id = ?
  `).run(title, annotation, id);

  db.prepare(`
    DELETE FROM books_fts WHERE rowid = ?
  `).run(id);

  db.prepare(`
    INSERT INTO books_fts (rowid, title, annotation)
    VALUES (?, ?, ?)
  `).run(id, titleFTS, annotationFTS);
}

/**
 * Optional: delete book
 */
function deleteBook(id) {
  db.prepare(`DELETE FROM books WHERE id = ?`).run(id);
  db.prepare(`DELETE FROM books_fts WHERE rowid = ?`).run(id);
}

module.exports = {
  insertBook,
  updateBook,
  deleteBook
};