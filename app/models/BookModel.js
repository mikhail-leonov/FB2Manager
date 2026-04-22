const db = require("../../core/db");
const { makeBookLink, makeAuthorLink, makeGenreLink, makeSeriesLink, makeFileLink } = require("../services/Link");
const { pagedQuery } = require("../../core/dbpagination");

class BookModel {

    static populateBooks(books) {
        if (!books || books.length === 0) return [];
 
        const bookIds = books.map(b => b.book_id);
        const placeholders = bookIds.map(() => "?").join(",");
    
        // =========================
        // AUTHORS (batch)
        // =========================
        const authorRows = db.prepare(`SELECT ba.book_id, a.* FROM BookAuthors ba JOIN Authors a ON a.author_id = ba.author_id WHERE ba.book_id IN (${placeholders}) `).all(...bookIds);
        const authorsMap = {};
        for (const row of authorRows) {
            if (!authorsMap[row.book_id]) authorsMap[row.book_id] = []; authorsMap[row.book_id].push(row);
        }

        // =========================
        // GENRES (batch)
        // =========================
        const genreRows = db.prepare(`SELECT bg.book_id, g.* FROM BookGenres bg JOIN Genres g ON g.genre_id = bg.genre_id WHERE bg.book_id IN (${placeholders}) `).all(...bookIds);
        const genresMap = {};
        for (const row of genreRows) {
            if (!genresMap[row.book_id]) genresMap[row.book_id] = []; genresMap[row.book_id].push(row);
        }

        // =========================
        // SERIES (batch)
        // =========================
        const seriesRows = db.prepare(`SELECT bs.book_id, s.*, bs.sequence_number FROM BookSeries bs JOIN Series s ON s.serie_id = bs.serie_id WHERE bs.book_id IN (${placeholders}) `).all(...bookIds);
        const seriesMap = {};
        for (const row of seriesRows) {
            if (!seriesMap[row.book_id]) seriesMap[row.book_id] = []; seriesMap[row.book_id].push(row);
        }

    
        return books.map(book => {
	    const a = authorsMap[book.book_id] || [];
	    const g = genresMap[book.book_id] || [];
	    const s = seriesMap[book.book_id] || [];
    
            return {
                ...book,
                Title: makeFileLink(book),
                Authors: a.map(makeAuthorLink).join(", "),
                Genres:  g.map(makeGenreLink).join(", "),
                Serie:  s.map(s => {
                    const link = makeSeriesLink(s);
                    return s.sequence_number
                    ? `${link} (#${s.sequence_number})`
                    : link;
                }).join(", ")
            };
        });
    }
    
    static getAll(page = 1, limit = 20) {
	const result = pagedQuery({ table: "Books", select: "book_id", page, limit });
        const ids = result.data.map(r => r.book_id);
        return { data: this.getByIds(ids), pagination: result.pagination };
    }
    static getById(id) {
        const result = this.getByIds([id]);
        return result.length ? result[0] : null;
    }
    static getByIds(ids) {
        if (!Array.isArray(ids) || ids.length === 0) { return []; }
        const param = ids.map(() => "?").join(",");
        const query = `SELECT title, book_id, hash, annotation FROM Books WHERE book_id IN (${param})`;
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
    static getAllHashes() {
        return db.prepare("SELECT hash FROM Books").all();
    }
}

module.exports = BookModel;