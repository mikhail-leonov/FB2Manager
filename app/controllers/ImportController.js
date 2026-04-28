const { render } = require("../../core/view");
const { importBooks } = require("../services/ImportService");
const { respond, error } = require("../services/Response");
const { CONTENT_TYPE_HTML } = require("../../core/constants");

class ImportController {

    static async run(req, res) {
        const html = await render("import.twig", {});
        res.writeHead(200, { "Content-Type": CONTENT_TYPE_HTML });
        return res.end(html);
    }
    static status(req, res) {
        res.writeHead(200, { "Content-Type": CONTENT_TYPE_JSON });
        res.end(JSON.stringify({
            running: !!global.importInProgress,
            startTime: global.importStartTime,
            filesProcessed: global.importProgress || 0
        }));
    }
    static async stream(req, res) {
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        });

        const send = (line) => {
            const clean = line.replace(/\n$/, "");
            if (clean) res.write(`data: ${clean}\n\n`);
        };

        try {
            await importBooks(send);
        } catch (e) {
            send(`Error: ${e.message}`);
        }

        res.write("data: [DONE]\n\n");
        res.end();
    }
}

module.exports = ImportController;