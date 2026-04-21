const db = require("../../core/db");
const { makeBookLink, makeAuthorLink, makeGenreLink, makeSeriesLink, makeFileLink } = require("../services/Link");


class BookModel {

    static populateBooks(books) {
        if (!books || books.length === 0) return [];
    
        const getAuthors = db.prepare(`
            SELECT a.* FROM Authors a
            JOIN BookAuthors ba ON a.author_id = ba.author_id
            WHERE ba.book_id = ?
        `);
    
        const getGenres = db.prepare(`
        SELECT g.* FROM Genres g
        JOIN BookGenres bg ON g.genre_id = bg.genre_id
            WHERE bg.book_id = ?
        `);
    
        const getSeries = db.prepare(`
            SELECT s.*, bs.sequence_number FROM Series s
            JOIN BookSeries bs ON s.serie_id = bs.serie_id
            WHERE bs.book_id = ?
        `);
    
        return books.map(book => {
            const a = getAuthors.all(book.book_id);
            const g = getGenres.all(book.book_id);
            const s = getSeries.all(book.book_id);
    
            return {
                ...book,
                title: makeBookLink(book),
                read: makeFileLink(book),
                authors: a.map(makeAuthorLink).join(", "),
                genres:  g.map(makeGenreLink).join(", "),
                serie:  s.map(s => {
                    const link = makeSeriesLink(s);
                    return s.sequence_number
                    ? `${link} (#${s.sequence_number})`
                    : link;
                }).join(", ")
            };
        });
    }
    
    static getAll() {
        const books = db.prepare("SELECT book_id FROM Books").all();
        const ids = books.map(r => r.book_id);
        return this.getByIds(ids);
    }

    static getById(id) {
        const result = this.getByIds([id]);
        return result.length ? result[0] : null;
    }

    static getByIds(ids) {
        if (!Array.isArray(ids) || ids.length === 0) { return []; }
        const param = ids.map(() => "?").join(",");
        const query = `SELECT title, book_id, hash FROM Books WHERE book_id IN (${param})`;
        const rows = db.prepare(query).all(...ids);
        return this.populateBooks(rows);
    }

    static create(book) {
        const stmt = db.prepare(`INSERT INTO Books ( book_id,title,language,annotation,publication_date,hash ) VALUES (?, ?, ?, ?, ?, ?)`);
        return stmt.run( book.book_id, book.title, book.language, book.annotation, book.publication_date, book.hash );
    }

    static delete(id) {
        return db.prepare("DELETE FROM Books WHERE book_id = ?").run(id);
    }
}

module.exports = BookModel;