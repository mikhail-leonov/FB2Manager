const { render } = require("../../core/view");
const SerieModel = require("../models/SerieModel");
const { renderTable, renderJson } = require("../services/ViewTable");
const { respond, error } = require("../services/Response");

class SerieController {

    static async index(req, res) {
        const data = SerieModel.getAll();
        return respond(req, res, "Series", data, true);
    }

    static async show(req, res, params) {
        const data = SerieModel.getById(params.id);

        if (!data) {
            return error(res, "Series not found", 404);
        }

        return respond(req, res, `Series: ${params.id}`, data);
    }
}

module.exports = SerieController;