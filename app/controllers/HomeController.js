const { respond } = require("../services/Response");

class HomeController {
    static async index(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const q = (url.searchParams.get("q") || "").trim();
        let result;
        if (q) { result = BookModel.search(req, q); } else { result = BookModel.getAll(req); }
        return respond( req, res, "My FB2 Collection", result.data, true, [], result.pagination ); 
    }
}

module.exports = HomeController;