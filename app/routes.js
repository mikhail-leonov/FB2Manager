const fs = require("fs");
const path = require("path");

const { FILES_DIR, FILES_PREFIX, JS_PREFIX, CONTENT_TYPE_JS } = require("../core/constants");

const HomeController = require("./controllers/HomeController");
const BookController = require("./controllers/BookController");
const ImportController = require("./controllers/ImportController");
const DbController = require("./controllers/DbController");
const AuthorController = require("./controllers/AuthorController");
const GenreController = require("./controllers/GenreController");
const SerieController = require("./controllers/SerieController");

function match(url, route) {
    const params = {};
    const u = url.split("/");
    const r = route.split("/");

    if (u.length !== r.length) return null;

    for (let i = 0; i < u.length; i++) {
        if (r[i].startsWith(":")) {
            params[r[i].slice(1)] = u[i];
        } else if (u[i] !== r[i]) {
            return null;
        }
    }

    return params;
}

async function router(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`).pathname;

    if (url.startsWith(JS_PREFIX)) {
        const filePath = path.join(__dirname, "..", url);
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { "Content-Type": CONTENT_TYPE_JS });
            return res.end(fs.readFileSync(filePath));
        }
        res.writeHead(404);
        return res.end("JS file not found");
    }
    if (url.startsWith(FILES_PREFIX)) {
        const file = url.split(FILES_PREFIX)[1];
        const filePath = path.join(FILES_DIR, file + ".fb2");
    
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { "Content-Type": "application/xml" });
            return res.end(fs.readFileSync(filePath));
        }
        res.writeHead(404);
        return res.end("File not found");
    }

    const routes = [
        ["GET", "/",          HomeController.index],
        ["GET", "/books",     BookController.index],
	["GET", "/import",    ImportController.run],
        ["GET", "/book/:id",  BookController.show],
        ["GET", "/author/:id",AuthorController.show],
        ["GET", "/genre/:id", GenreController.show],
        ["GET", "/serie/:id", SerieController.show],
        ["GET", "/authors",   AuthorController.index],
        ["GET", "/genres",    GenreController.index],
        ["GET", "/series",    SerieController.index],
        ["GET", "/db",        DbController.dump],
        ["GET", "/db/:name",  DbController.table],
        ["GET", "/db-stats",  DbController.stats],
        ["GET", "/db-schema", DbController.schema],
        ["GET", "/db-clean",  DbController.clean],    
    ];

    for (const [method, path, handler] of routes) {
        if (req.method !== method) continue;

        const params = match(url, path);
        if (params) {
            return handler(req, res, params);
        }
    }

    res.writeHead(404);
    res.end("404 Not Found");
}

module.exports = router;