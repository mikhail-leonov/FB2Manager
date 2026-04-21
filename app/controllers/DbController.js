const { render } = require("../../core/view");
const { dumpDb, dumpTable, stats, schema, cleanDb } = require("../services/DbDumpService");
const { renderTable, renderJson } = require("../services/ViewTable");
const { respond, error } = require("../services/Response");

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

module.exports = DbController;