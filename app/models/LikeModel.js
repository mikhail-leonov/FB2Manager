// =============================
// Constants
// =============================

const db = require("../../core/db");

// ======================
// PRECOMPILED STATEMENTS
// ======================

const isLikedStmt = db.prepare(`SELECT COUNT(*) AS c FROM Likes WHERE book_id = ?`);
const likeStmt = db.prepare(`INSERT OR IGNORE INTO Likes (book_id) VALUES (?)`);
const unlikeStmt = db.prepare(`DELETE FROM Likes WHERE book_id = ?`);

// ======================
// MODEL
// ======================

class LikeModel {

    static isLiked(book_id) {
        return isLikedStmt.get(book_id).c > 0;
    }

    static like(book_id) {
        try {
            return likeStmt.run(book_id);
        } catch (e) {
            console.error("Error liking book:", e);
            return null;
        }
    }

    static unlike(book_id) {
        try {
            return unlikeStmt.run(book_id);
        } catch (e) {
            console.error("Error unliking book:", e);
            return null;
        }
    }
}

module.exports = LikeModel;