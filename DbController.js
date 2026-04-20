const db = require("../../core/db");
const crypto = require("crypto");

class GenreModel {

    getAll() {
        return db.prepare("SELECT * FROM Genres").all();
    }

    getById(id) {
        return db.prepare("SELECT * FROM Genres WHERE genre_id = ?").get(id);
    }

    findByTitle(title) {
        return db.prepare("SELECT * FROM Genres WHERE title = ?").get(title);
    }

    create(genre) {
        const stmt = db.prepare(`INSERT INTO Genres (genre_id, title) VALUES (?, ?)`);
        return stmt.run( genre.genre_id, genre.title );
    }

    getOrCreate(title) {
        if (!title) { return null; }
        const existing = this.findByTitle(title);
        if (existing) { return existing; }
        const genre = { genre_id: crypto.randomBytes(12).toString("hex"), title };
        this.create(genre);
        return genre;
    }

    delete(id) {
        return db.prepare("DELETE FROM Genres WHERE genre_id = ?").run(id);
    }
}

module.exports = new GenreModel();