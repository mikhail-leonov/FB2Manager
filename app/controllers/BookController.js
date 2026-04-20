const { render } = require("../../core/view");
const BookModel = require("../models/BookModel");
const { renderTable, renderJson } = require("../services/ViewTable");

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

/* =========================
   RESPONSE LAYER
========================= */

async function respond(req, res, title, data, isTable = false) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const asJson = url.searchParams.get("json");
    if (asJson) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(data, null, 2));
    }
    let content;
    if (Array.isArray(data) && isTable) {
        content = renderTable(data);
    } else {
        content = renderJson(data);
    }
    const html = await render("page.twig", { title, content });
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
}

function error(res, msg, code = 400) {
    res.writeHead(code);
    res.end(msg);
}

module.exports = BookController;