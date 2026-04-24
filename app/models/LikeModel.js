const db = require("../../core/db");

class LikeModel {
    
    static isLiked(book_id) {
        const result = db.prepare("SELECT 1 FROM Likes WHERE book_id = ?").get(book_id);
        return !!result;
    }
    static like(book_id) {
        try {
            return db.prepare(`INSERT OR IGNORE INTO Likes (book_id) VALUES (?) `).run(book_id);
        } catch (e) {
            console.error("Error liking book:", e);
            return null;
        }
    }
    static unlike(book_id) {
        try {
            return db.prepare(`DELETE FROM Likes WHERE book_id = ?`).run(book_id);
        } catch (e) {
            console.error("Error unliking book:", e);
            return null;
        }
    }
}

module.exports = LikeModel;