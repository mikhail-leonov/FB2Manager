const { importBooks } = require("../services/ImportService");
const { respond, error } = require("../services/Response");

class ImportController {
    static async run(req, res) {
        try {
            const result = importBooks();
            return respond(req, res, "Import Result", result);
        } catch (e) {
            return error(res, e.message);
        }
    }
}

module.exports = ImportController;