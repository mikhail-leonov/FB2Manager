const { render } = require("../../core/view");
const { importBooks } = require("../services/ImportService");
const { respond, error } = require("../services/Response");
const { CONTENT_TYPE_HTML, CONTENT_TYPE_JSON } = require("../../core/constants");

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
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked"
        });

        // IMPORTANT: force headers out immediately
        if (res.flushHeaders) res.flushHeaders();

        const send = (line) => {
            const clean = line.replace(/\n$/, "");
            if (clean) {
                res.write(`data: ${clean}\n\n`);
                if (res.flush) res.flush();
            }
        };

        // expose globally (your existing logic)
        global.sseLogSend = send;

        // send first message so frontend connects instantly
        send("// Stream connected");

        const heartbeat = setInterval(() => { try { res.write(`data: [PING]\n\n`); } catch (e) { clearInterval(heartbeat); } }, 15000);

        req.on('close', () => {
            clearInterval(heartbeat);
            global.sseLogSend = null;
            try { res.end(); } catch {}
        });

        try {
            await importBooks(send);
        } catch (e) {
            send(`Error: ${e.message}`);
        } finally {
            clearInterval(heartbeat); 
            global.sseLogSend = null;
        }

        res.write("data: [DONE]\n\n");
        res.end();
    }
}

module.exports = ImportController;