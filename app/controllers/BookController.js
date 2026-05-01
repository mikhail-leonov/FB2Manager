// =============================
// Constants
// =============================

const BookModel = require("../models/BookModel");
const { render } = require("../../core/view");
const { renderTable, renderJson } = require("../services/ViewTable");
const { respond, error } = require("../services/Response");
const { BOOK_COLUMNS } = require("../services/tableColumns");
const { paginate } = require("../../core/pagination");
const { renderBookPage } = require("../renders/BookRender");
const {BOOKS_PER_PAGE} = require("../../core/constants");

// =============================
// Controller
// =============================

class BookController {

    static async index(req, res) {
        const result = BookModel.getAll(req);
        return respond( req, res, "Books", result.data, true, BOOK_COLUMNS.hidden, result.pagination );
    }
    static async show(req, res, params) {
        const book = BookModel.getById(params.id);
        if (!book) {
            return error(res, "Book not found", 404);
        }
        return renderBookPage(res, book);
    }
    static async favorite(req, res) {
        const result = BookModel.getFavorite(req);
        return respond( req, res, "Books", result.data, true, BOOK_COLUMNS.hidden, result.pagination );
    }
}

module.exports = BookController;