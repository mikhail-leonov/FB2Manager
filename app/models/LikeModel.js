const db = require("../../core/db");

class LikeModel {
    
    static isLiked(book_id) {
        return db.prepare(`SELECT COUNT(*) AS c FROM Likes WHERE book_id = ?`).get(book_id).c > 0;
    }
    static like(book_id) {
        let result;
        try {
            result = db.prepare(`INSERT OR IGNORE INTO Likes (book_id) VALUES (?)`).run(book_id);
        } catch (e) {
            console.error("Error liking book:", e);
            result = null;
        }
	return result;
    }
    static unlike(book_id) {
        let result;
        try {
            result = db.prepare(`DELETE FROM Likes WHERE book_id = ?`).run(book_id);
        } catch (e) {
            console.error("Error unliking book:", e);
            result = null;
        }
	return result;
    }
}

module.exports = LikeModel;