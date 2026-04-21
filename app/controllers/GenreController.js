const GenreModel = require("../models/GenreModel");
const BookGenreModel = require("../models/BookGenreModel");
const BookModel = require("../models/BookModel");

const { render } = require("../../core/view");
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
    static async books(req, res, params) {
        const data = BookGenreModel.getBooks(params.id, BookModel);
        if (!data) {
            return error(res, "Author not found", 404);
        }
        return respond(req, res, `Author: ${params.id}`, data, false);
    }
}

module.exports = GenreController;