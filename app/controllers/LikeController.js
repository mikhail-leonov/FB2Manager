// =============================
// Constants
// =============================

const LikeModel = require("../models/LikeModel");
const BookModel = require("../models/BookModel");
const { CONTENT_TYPE_JSON } = require("../../core/constants");

// =============================
// Controller
// =============================

class LikeController {
    
    static async like(req, res, params) {
        const id = params.id;
        const uid = params.uid;
        const book_id = id + "/" + uid;
        LikeModel.like(book_id);
        res.writeHead(200, { "Content-Type": CONTENT_TYPE_JSON });
        return res.end(JSON.stringify({ success: true, action: "liked", book_id }));
    }
    static async unlike(req, res, params) {
        const id = params.id;
        const uid = params.uid;
        const book_id = id + "/" + uid;
        LikeModel.unlike(book_id);
        res.writeHead(200, { "Content-Type": CONTENT_TYPE_JSON });
        return res.end(JSON.stringify({ success: true,  action: "unliked", book_id  }));
    }
    static async status(req, res, params) {
        const id = params.id;
        const uid = params.uid;
        const book_id = id + "/" + uid;
        const liked = LikeModel.isLiked(book_id);
        res.writeHead(200, { "Content-Type": CONTENT_TYPE_JSON });
        return res.end(JSON.stringify({  success: true, book_id,  liked  }));
    }
}

module.exports = LikeController;