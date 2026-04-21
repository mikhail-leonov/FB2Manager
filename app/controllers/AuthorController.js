const AuthorModel = require("../models/AuthorModel");
const BookAuthorModel = require("../models/BookAuthorModel");
const BookModel = require("../models/BookModel");

const { render } = require("../../core/view");
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

    static async books(req, res, params) {
        const data = BookAuthorModel.getBooks(params.id, BookModel);
        if (!data) {
            return error(res, "Author not found", 404);
        }
        return respond(req, res, `Author: ${params.id}`, data, false);
    }
}

module.exports = AuthorController;