const db = require("../../core/db");
const { pagedQuery } = require("../../core/dbpagination");
const {
    makeBookLink,
    makeAuthorLink,
    makeGenreLink,
    makeSeriesLink,
    makeFileLink
} = require("../services/Link");

class BookModel {

    static getAll(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);
        const result = pagedQuery({ table: "Books", select: "book_id", page, limit });
        const ids = result.data.map(r => r.book_id);
        return { data: this.getByIds(ids), pagination: result.pagination };
    }
    static getById(id) {
        const result = this.getByIds([id]);
        return result.length ? result[0] : null;
    }

    static getByIds(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return [];

        const placeholders = ids.map(() => "?").join(",");

        const rows = db.prepare(`
            SELECT title, book_id, hash, annotation
            FROM Books
            WHERE book_id IN (${placeholders})
        `).all(...ids);

        return this.populateBooks(rows);
    }

    static create(book) {
        const stmt = db.prepare(`INSERT INTO Books ( book_id,title,language,annotation,publication_date,hash ) VALUES (?, ?, ?, ?, ?, ?)`);
        return stmt.run( book.book_id, book.title, book.language, book.annotation, book.publication_date, book.hash );
    }

    static getAllHashes() {
        return db.prepare("SELECT hash FROM Books").all();
    }

    static populateBooks(books) {
        if (!books.length) return [];

        const ids = books.map(b => b.book_id);
        const ph = ids.map(() => "?").join(",");

        const authors = db.prepare(`
            SELECT ba.book_id, a.*
            FROM BookAuthors ba
            JOIN Authors a ON a.author_id = ba.author_id
            WHERE ba.book_id IN (${ph})
        `).all(...ids);

        const genres = db.prepare(`
            SELECT bg.book_id, g.*
            FROM BookGenres bg
            JOIN Genres g ON g.genre_id = bg.genre_id
            WHERE bg.book_id IN (${ph})
        `).all(...ids);

        const series = db.prepare(`
            SELECT bs.book_id, s.*, bs.sequence_number
            FROM BookSeries bs
            JOIN Series s ON s.serie_id = bs.serie_id
            WHERE bs.book_id IN (${ph})
        `).all(...ids);

        const aMap = {};
        const gMap = {};
        const sMap = {};

        for (const r of authors) {
            (aMap[r.book_id] ||= []).push(r);
        }
        for (const r of genres) {
            (gMap[r.book_id] ||= []).push(r);
        }
        for (const r of series) {
            (sMap[r.book_id] ||= []).push(r);
        }

        return books.map(b => {
            const a = aMap[b.book_id] || [];
            const g = gMap[b.book_id] || [];
            const s = sMap[b.book_id] || [];

            return {
                ...b,
                Title: makeFileLink(b),
                Authors: a.map(makeAuthorLink).join(", "),
                Genres: g.map(makeGenreLink).join(", "),
                Serie: s.map(x => {
                    const link = makeSeriesLink(x);
                    return x.sequence_number ? `${link} (#${x.sequence_number})` : link;
                }).join(", ")
            };
        });
    }
}

module.exports = BookModel;