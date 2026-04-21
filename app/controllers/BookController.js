const BookModel = require("../models/BookModel");

const { render } = require("../../core/view");
const { renderTable, renderJson } = require("../services/ViewTable");
const { respond, error } = require("../services/Response");
const { BOOK_COLUMNS } = require("../services/tableColumns");

class BookController {

    static async index(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const data = BookModel.getAll(page);
        return respond(req, res, "Books", data, true, BOOK_COLUMNS.hidden );
    }
    static async show(req, res, params) {
        const data = BookModel.getById(params.id);
        if (!data) { return error(res, "Book not found", 404); }
        return respond(req, res, `Book: ${params.id}`, data, false, BOOK_COLUMNS.hidden );
    }
}

module.exports = BookController;