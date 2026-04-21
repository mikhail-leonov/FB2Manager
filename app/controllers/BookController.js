const { render } = require("../../core/view");
const BookModel = require("../models/BookModel");
const { renderTable, renderJson } = require("../services/ViewTable");
const { respond, error } = require("../services/Response");

class BookController {

    static async index(req, res) {
        const data = BookModel.getAll();
        return respond(req, res, "Books", data, true);
    }

    static async show(req, res, params) {
        const data = BookModel.getById(params.id);
        if (!data) {
            return error(res, "Book not found", 404);
        }
        return respond(req, res, `Book: ${params.id}`, data);
    }

    static async create(req, res, body) {
        try {
            const result = BookModel.create(body);
            return respond(req, res, "Book Created", { success: true, changes: result.changes });
        } catch (e) {
            return error(res, e.message);
        }
    }

    static async delete(req, res, params) {
        const result = BookModel.delete(params.id);
        return respond(req, res, "Book Deleted", { deleted: result.changes });
    }
}

module.exports = BookController;