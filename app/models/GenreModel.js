const db = require("../../core/db");
const crypto = require("crypto");
const { pagedQuery } = require("../../core/dbpagination");

class GenreModel {

    static getAll(page = 1, limit = 20) {
	return pagedQuery({ table: "Genres", page, limit });
    }
    static getById(id) {
        return db.prepare("SELECT * FROM Genres WHERE genre_id = ?").get(id);
    }
    static findByTitle(title) {
        return db.prepare("SELECT * FROM Genres WHERE title = ?").get(title);
    }
    static getOrCreate(title) {
        if (!title) return null;
        const existing = this.findByTitle(title);
        if (existing) return existing;
        const genre = {
            genre_id: crypto.randomBytes(12).toString("hex"),
            title
        };
        this.create(genre);
        return genre;
    }
    static create(genre) {
        return db.prepare("INSERT INTO Genres (genre_id, title) VALUES (?, ?)").run(genre.genre_id, genre.title);
    }
    static delete(id) {
        return db.prepare("DELETE FROM Genres WHERE genre_id = ?").run(id);
    }
}

module.exports = GenreModel;