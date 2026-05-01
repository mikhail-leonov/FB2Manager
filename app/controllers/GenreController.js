// =============================
// Constants
// =============================

const GenreModel = require("../models/GenreModel");
const BookGenreModel = require("../models/BookGenreModel");
const BookModel = require("../models/BookModel");
const { respond, error } = require("../services/Response");
const { GENRE_COLUMNS } = require("../services/tableColumns");
const {BOOKS_PER_PAGE} = require("../../core/constants");

// =============================
// Controller
// =============================

class GenreController {

    static async index(req, res) {
        const result = GenreModel.getAll(req);
        return respond( req, res, "Genres", result.data, true, GENRE_COLUMNS.hidden, result.pagination );
    }
    static async show(req, res, params) {
        const data = GenreModel.getById(params.id);
        if (!data) return error(res, "Genre not found", 404);
        return respond(req, res, `Genre: ${params.id}`, data, false, GENRE_COLUMNS.hidden);
    }

    static async books(req, res, params) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") ?? BOOKS_PER_PAGE, 10);

        const result = BookGenreModel.getBooks(params.id, BookModel, page, limit);

        if (!result.data.length && page === 1) {
            return error(res, "Genre not found", 404);
        }

        return respond(
            req,
            res,
            `Genre: ${params.id}`,
            result.data,
            true,
            GENRE_COLUMNS.hidden,
            result.pagination
        );
    }
}

module.exports = GenreController;