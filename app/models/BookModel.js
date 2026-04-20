const db = require("../../core/db");
const { makeBookLink, makeAuthorLink, makeGenreLink, makeSeriesLink } = require("../services/Link");

class BookModel {

    populateBooks(books) {
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
            const authors = getAuthors.all(book.book_id);
            const genres  = getGenres.all(book.book_id);
            const series  = getSeries.all(book.book_id);
    
            return {
                ...book,
                book_html: makeBookLink(book),
                authors_html: authors.map(makeAuthorLink).join(", "),
                genres_html:  genres.map(makeGenreLink).join(", "),
                series_html:  series.map(s => {
                    const link = makeSeriesLink(s);
                    return s.sequence_number
                    ? `${link} (#${s.sequence_number})`
                    : link;
                }).join(", ")
            };
        });
    }
    
    getAll() {
        const books = db.prepare("SELECT book_id, title, annotation, hash FROM Books").all();
        return this.populateBooks(books);
    }

    getById(id) {
        let result = [];
        const book = db.prepare("SELECT book_id, title, annotation, hash FROM Books WHERE book_id = ?").get(id);
        if (book) {
            const books = this.populateBooks([book]);
            result = books[0];
        }
        return result;
    }

    create(book) {
        const stmt = db.prepare(`INSERT INTO Books ( book_id,title,language,annotation,publication_date,hash ) VALUES (?, ?, ?, ?, ?, ?)`);
        return stmt.run( book.book_id, book.title, book.language, book.annotation, book.publication_date, book.hash );
    }

    delete(id) {
        return db.prepare("DELETE FROM Books WHERE book_id = ?").run(id);
    }
}

module.exports = new BookModel();