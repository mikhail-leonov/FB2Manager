const { render } = require("../../core/view");
const AuthorModel = require("../models/AuthorModel");
const { renderTable, renderJson } = require("../services/ViewTable");

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
        return respond(req, res, `Author: ${params.id}`, data);
    }
}

/* RESPONSE */

async function respond(req, res, title, data, isTable = false) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const asJson = url.searchParams.get("json");

    if (asJson) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(data, null, 2));
    }

    let content = (Array.isArray(data) && isTable)
        ? renderTable(data)
        : renderJson(data);

    const html = await render("page.twig", { title, content });

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
}

function error(res, msg, code = 400) {
    res.writeHead(code);
    res.end(msg);
}

module.exports = AuthorController;