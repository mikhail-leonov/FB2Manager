// =============================
// Constants
// =============================

const DebugModel = require("../models/DebugModel");
const { render } = require("../../core/view");
const { renderTable, renderJson } = require("../services/ViewTable");
const { CONTENT_TYPE_HTML } = require("../../core/constants");

// =============================
// Controller
// =============================

class DebugController {

    static async index(req, res) {
        const html = await render("debug.twig", {});
        res.writeHead(200, { "Content-Type": CONTENT_TYPE_HTML });
        return res.end(html);
    }
}

module.exports = DebugController;