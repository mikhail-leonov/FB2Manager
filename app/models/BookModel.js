const db = require("../../core/db");
const { paginate } = require("../../core/pagination");
const { pagedQuery } = require("../../core/dbpagination");
const { buildSearchQuery } = require("../services/SearchQueryBuilder");
const { BOOKS_PER_PAGE, ALL_COLUMNS } = require("../../core/constants");
const { makeBookLink, makeAuthorLink, makeGenreLink, makeDownloadLink, makeSeriesLink, makeFileLink } = require("../services/Link");

// ======================
// PRECOMPILED STATEMENTS
// ======================

const getBooksByIdsStmt = db.prepare(`SELECT title, book_id, hash, annotation FROM Books WHERE book_id IN ($ids)`);
const getAllHashesStmt = db.prepare(`SELECT hash FROM Books`);
const createBookStmt = db.prepare(`INSERT INTO Books ( book_id, title, language, annotation, publication_date, hash ) VALUES (?, ?, ?, ?, ?, ?)`);
const searchCountStmt = db.prepare(`SELECT COUNT(DISTINCT rowid) AS c FROM BooksFTS WHERE BooksFTS MATCH ?`);
const searchIdsStmt = db.prepare(`SELECT DISTINCT rowid FROM BooksFTS WHERE BooksFTS MATCH ? LIMIT ? OFFSET ?`);
const booksByRowidsStmt = db.prepare(`SELECT book_id FROM Books WHERE rowid IN ($ids)`);
const authorsByBooksStmt = db.prepare(`SELECT ba.book_id, a.* FROM BookAuthors ba JOIN Authors a ON a.author_id = ba.author_id WHERE ba.book_id IN ($ids) `);
const genresByBooksStmt = db.prepare(`SELECT bg.book_id, g.* FROM BookGenres bg JOIN Genres g ON g.genre_id = bg.genre_id WHERE bg.book_id IN ($ids) `);
const seriesByBooksStmt = db.prepare(`SELECT bs.book_id, s.*, bs.sequence_number FROM BookSeries bs JOIN Series s ON s.serie_id = bs.serie_id WHERE bs.book_id IN ($ids) `);

// helper for IN queries (better-sqlite3 pattern)
function bindIn(stmt, ids) { return stmt.all({ ids: ids.join(",") }); }

// ======================
// MODEL
// ======================

class BookModel {

    static getAll(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") ?? BOOKS_PER_PAGE, 10);
        const sortBy = url.searchParams.get("sort") || "rowid";
        const sortOrder = url.searchParams.get("order") || "DESC";

        const validSortBy = ALL_COLUMNS.includes(sortBy) ? sortBy : "rowid";
        const validOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
        const orderBy = `${validSortBy} ${validOrder}`;

        const result = pagedQuery({
            table: "Books",
            select: "book_id",
            page,
            limit,
            orderBy
        });

        const ids = result.data.map(r => r.book_id);

        return {
            data: this.getByIds(ids),
            pagination: result.pagination
        };
    }

static getFavorite(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? BOOKS_PER_PAGE, 10);
    const sortBy = url.searchParams.get("sort") || "rowid";
    const sortOrder = url.searchParams.get("order") || "DESC";

    const validSortBy = ALL_COLUMNS.includes(sortBy) ? sortBy : "rowid";
    const validOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const orderBy = `${validSortBy} ${validOrder}`;

    const result = pagedQuery({
        table: "Books INNER JOIN Likes ON Books.book_id = Likes.book_id",
        select: "Books.book_id",
        page,
        limit,
        orderBy
    });

    const ids = result.data.map(r => r.book_id);

    return {
        data: this.getByIds(ids),
        pagination: result.pagination
    };
}

    static getById(id) {
        const result = this.getByIds([id]);
        return result.length ? result[0] : null;
    }

static getByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    
    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`
        SELECT title, book_id, hash, annotation 
        FROM Books 
        WHERE book_id IN (${placeholders})
    `);
    
    const rows = stmt.all(...ids);
    return this.populateBooks(rows);
}

    static search(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") ?? BOOKS_PER_PAGE, 10);
        const q = (url.searchParams.get("q") || "").trim();

        const ftsQuery = buildSearchQuery(q);

        const total = searchCountStmt.get(ftsQuery)?.c || 0;

        const pagination = paginate({
            page,
            limit,
            total
        });

        const rowids = searchIdsStmt
            .all(ftsQuery, pagination.limit, pagination.offset)
            .map(r => r.rowid);

        if (!rowids.length) {
            return { data: [], pagination };
        }

        const books = booksByRowidsStmt
            .all({ ids: rowids.join(",") });

        const ids = books.map(b => b.book_id);

        return {
            data: this.getByIds(ids),
            pagination
        };
    }

    static create(book) {
        return createBookStmt.run(
            book.book_id,
            book.title,
            book.language,
            book.annotation,
            book.publication_date,
            book.hash
        );
    }

    static getAllHashes() {
        return getAllHashesStmt.all();
    }

    static populateBooks(books) {
        if (!books.length) return [];

        const ids = books.map(b => b.book_id);

        const authors = authorsByBooksStmt.all({ ids: ids.join(",") });
        const genres = genresByBooksStmt.all({ ids: ids.join(",") });
        const series = seriesByBooksStmt.all({ ids: ids.join(",") });

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
                Download: makeDownloadLink(b),
                Meta: makeBookLink(b),
                Authors: a.map(makeAuthorLink).join(", "),
                Genres: g.map(makeGenreLink).join(", "),
                Serie: s.map(x => {
                    const link = makeSeriesLink(x);
                    return x.sequence_number
                        ? `${link} (#${x.sequence_number})`
                        : link;
                }).join(", ")
            };
        });
    }
}

module.exports = BookModel;