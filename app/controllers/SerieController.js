const SerieModel = require("../models/SerieModel");
const BookSerieModel = require("../models/BookSerieModel");
const BookModel = require("../models/BookModel");

const { render } = require("../../core/view");
const { renderTable, renderJson } = require("../services/ViewTable");
const { respond, error } = require("../services/Response");
const { SERIE_COLUMNS } = require("../services/tableColumns");

class SerieController {

    static async index(req, res) {
        const data = SerieModel.getAll();
        return respond(req, res, "Series", data, true, SERIE_COLUMNS.hidden);
    }
    static async show(req, res, params) {
        const data = SerieModel.getById(params.id);
        if (!data) { return error(res, "Series not found", 404); }
        return respond(req, res, `Series: ${params.id}`, data, SERIE_COLUMNS.hidden);
    }
    static async books(req, res, params) {
        const data = BookSerieModel.getBooks(params.id, BookModel);
        if (!data) { return error(res, "Author not found", 404); }
        return respond(req, res, `Serie: ${params.id}`, data, true, SERIE_COLUMNS.hidden);
    }
}

module.exports = SerieController;