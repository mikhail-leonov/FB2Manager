const { render } = require("../../core/view");
const GenreModel = require("../models/GenreModel");
const { renderTable, renderJson } = require("../services/ViewTable");
const { respond, error } = require("../services/Response");

class GenreController {

    static async index(req, res) {
        const data = GenreModel.getAll();
        return respond(req, res, "Genres", data, true);
    }

    static async show(req, res, params) {
        const data = GenreModel.getById(params.id);

        if (!data) {
            return error(res, "Genre not found", 404);
        }

        return respond(req, res, `Genre: ${params.id}`, data);
    }
}

module.exports = GenreController;