// =============================
// Constants
// =============================

const AuthorModel = require("../models/AuthorModel");
const BookAuthorModel = require("../models/BookAuthorModel");
const BookModel = require("../models/BookModel");
const {BOOKS_PER_PAGE} = require("../../core/constants");
const { respond, error } = require("../services/Response");
const { AUTHOR_COLUMNS } = require("../services/tableColumns");

// =============================
// Controller
// =============================

class AuthorController {

    static async index(req, res) {
        const result = AuthorModel.getAll(req);
        return respond( req, res, "Authors", result.data, true, AUTHOR_COLUMNS.hidden, result.pagination );
    }
    static async show(req, res, params) {
        const data = AuthorModel.getById(params.id);
        if (!data) return error(res, "Author not found", 404);
        return respond(req, res, `Author: ${params.id}`, data, false, AUTHOR_COLUMNS.hidden);
    }

    static async books(req, res, params) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") ?? BOOKS_PER_PAGE, 10);
        const result = BookAuthorModel.getBooks(params.id, BookModel, page, limit);
        if (!result.data.length && page === 1) {
            return error(res, "Author not found", 404);
        }

        return respond(
            req,
            res,
            `Author: ${params.id}`,
            result.data,
            true,
            AUTHOR_COLUMNS.hidden,
            result.pagination
        );
    }
}

module.exports = AuthorController;