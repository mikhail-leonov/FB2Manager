const BookModel = require("../models/BookModel");

const { render } = require("../../core/view");
const { renderTable, renderJson } = require("../services/ViewTable");
const { respond, error } = require("../services/Response");
const { BOOK_COLUMNS } = require("../services/tableColumns");
const { paginate } = require("../../core/pagination");

class BookController {

    static async index(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);
        const result = BookModel.getAll(page, limit);
        return respond( req, res, "Books", result.data, true, BOOK_COLUMNS.hidden, result.pagination );
    }
    static async show(req, res, params) {
        const data = BookModel.getById(params.id);
        if (!data) { return error(res, "Book not found", 404); }
        return respond(req, res, `Book: ${params.id}`, data, false, BOOK_COLUMNS.hidden );
    }
}

module.exports = BookController;