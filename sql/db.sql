-- =========================
-- PRAGMAS (IMPORTANT FOR SQLITE)
-- =========================
PRAGMA foreign_keys = ON;

-- =========================
-- TABLES
-- =========================

CREATE TABLE IF NOT EXISTS Books (
    book_id VARCHAR(32) PRIMARY KEY,
    title TEXT NOT NULL,
    language VARCHAR(64),
    annotation TEXT,
    publication_date TEXT,
    hash TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS Authors (
    author_id VARCHAR(32) PRIMARY KEY,
    firstname VARCHAR(64) NOT NULL,
    middlename VARCHAR(64),
    lastname VARCHAR(64) NOT NULL,
    UNIQUE (firstname, middlename, lastname)
);

CREATE TABLE IF NOT EXISTS Genres (
    genre_id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS Series (
    serie_id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(128) NOT NULL
);

-- =========================
-- JUNCTION TABLES (STRICT FK + CASCADE)
-- =========================

CREATE TABLE IF NOT EXISTS BookAuthors (
    book_id VARCHAR(32) NOT NULL,
    author_id VARCHAR(32) NOT NULL,

    PRIMARY KEY (book_id, author_id),

    FOREIGN KEY (book_id)
        REFERENCES Books(book_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (author_id)
        REFERENCES Authors(author_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS BookGenres (
    book_id VARCHAR(32) NOT NULL,
    genre_id VARCHAR(32) NOT NULL,

    PRIMARY KEY (book_id, genre_id),

    FOREIGN KEY (book_id)
        REFERENCES Books(book_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (genre_id)
        REFERENCES Genres(genre_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS BookSeries (
    book_id VARCHAR(32) NOT NULL,
    serie_id VARCHAR(32) NOT NULL,
    sequence_number INTEGER,

    PRIMARY KEY (book_id, serie_id),

    FOREIGN KEY (book_id)
        REFERENCES Books(book_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (serie_id)
        REFERENCES Series(serie_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- INDEXES (BOOKS + LOOKUPS)
-- =========================

CREATE INDEX IF NOT EXISTS idx_books_title ON Books(title);
CREATE INDEX IF NOT EXISTS idx_authors_name ON Authors(lastname, middlename, firstname);
CREATE INDEX IF NOT EXISTS idx_genre_title ON Genres(title);
CREATE INDEX IF NOT EXISTS idx_serie_title ON Series(title);

-- =========================
-- FK PERFORMANCE INDEXES
-- =========================

CREATE INDEX IF NOT EXISTS idx_bookauthors_book ON BookAuthors(book_id);
CREATE INDEX IF NOT EXISTS idx_bookauthors_author ON BookAuthors(author_id);

CREATE INDEX IF NOT EXISTS idx_bookgenres_book ON BookGenres(book_id);
CREATE INDEX IF NOT EXISTS idx_bookgenres_genre ON BookGenres(genre_id);

CREATE INDEX IF NOT EXISTS idx_bookseries_book ON BookSeries(book_id);
CREATE INDEX IF NOT EXISTS idx_bookseries_series ON BookSeries(serie_id);


-- =========================
-- FTS5 FULL-TEXT SEARCH
-- =========================
CREATE VIRTUAL TABLE IF NOT EXISTS BooksFTS USING fts5(
    title, annotation, content='Books', content_rowid='rowid', tokenize = 'unicode61'
);
