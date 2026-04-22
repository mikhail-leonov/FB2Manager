const SerieModel = require("../models/SerieModel");
const BookSerieModel = require("../models/BookSerieModel");
const BookModel = require("../models/BookModel");

const { respond, error } = require("../services/Response");
const { SERIE_COLUMNS } = require("../services/tableColumns");

class SerieController {

    static async index(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);

        const result = SerieModel.getAll(page, limit);

        return respond(
            req,
            res,
            "Series",
            result.data,
            true,
            SERIE_COLUMNS.hidden,
            result.pagination
        );
    }

    static async show(req, res, params) {
        const data = SerieModel.getById(params.id);
        if (!data) return error(res, "Series not found", 404);

        return respond(req, res, `Series: ${params.id}`, data, false, SERIE_COLUMNS.hidden);
    }

    static async books(req, res, params) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);

        const result = BookSerieModel.getBooks(params.id, BookModel, page, limit);

        if (!result.data.length && page === 1) {
            return error(res, "Serie not found", 404);
        }

        return respond(
            req,
            res,
            `Serie: ${params.id}`,
            result.data,
            true,
            SERIE_COLUMNS.hidden,
            result.pagination
        );
    }
}

module.exports = SerieController;