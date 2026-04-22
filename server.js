const http = require("http");
const router = require("./app/routes");
const { bootstrapDatabase } = require("./core/bootstrap");

const PORT = 3000;
const VERSION = "0.0.46";

// init DB + schema + samples
bootstrapDatabase();

http.createServer(async (req, res) => {
    try {
        return await router(req, res);
    } catch (e) {
        console.error(e);
        res.writeHead(500);
        res.end("Internal Server Error");
    }
}).listen(PORT, () => {
    console.log(`Server v${VERSION} running on http://localhost:${PORT}`);
});