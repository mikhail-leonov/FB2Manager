const { render } = require("../../core/view");
const { dumpDb, dumpTable, stats, schema, cleanDb } = require("../services/DbDumpService");
const { renderTable, renderJson } = require("../services/ViewTable");

class DbController {

    static async dump(req, res) {
        const data = dumpDb();
        return respond(req, res, "DB Dump", data);
    }

    static async table(req, res, params) {
        try {
            const data = dumpTable(params.name);
            return respond(req, res, `Table: ${params.name}`, data, true);
        } catch (e) {
            return error(res, e.message);
        }
    }

    static async stats(req, res) {
        const data = stats();
        return respond(req, res, "DB Stats", data);
    }

    static async schema(req, res) {
        const data = schema();
        return respond(req, res, "DB Schema", data);
    }

    static async clean(req, res) {
        const result = cleanDb();
        return respond(req, res, "DB Clean", result);
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

    const html = await render("page.twig", {
        title,
        content
    });

    res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
    });

    res.end(html);
}

function error(res, msg) {
    res.writeHead(400);
    res.end(msg);
}

module.exports = DbController;