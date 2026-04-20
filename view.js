const { importBooks } = require("../services/ImportService");

class ImportController {
    static run(req, res) {
        const result = importBooks();

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify(result));
    }
}

module.exports = ImportController;