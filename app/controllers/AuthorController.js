const AuthorModel = require("../models/AuthorModel");
const { renderTable, renderJson } = require("../services/ViewTable");
const { respond, error } = require("../services/Response");

class AuthorController {

    static async index(req, res) {
        const data = AuthorModel.getAll();
        return respond(req, res, "Authors", data, true);
    }

    static async show(req, res, params) {
        const data = AuthorModel.getById(params.id);

        if (!data) {
            return error(res, "Author not found", 404);
        }

        return respond(req, res, `Author: ${params.id}`, data, false);
    }
}

module.exports = AuthorController;