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
    let url = new URL(req.url, `http://${req.headers.host}`).pathname;
    url = url.replace(/\/+$/, "") || "/";

    if (url.startsWith(JS_PREFIX)) {

        const base = path.join(__dirname, "..");
        const filePath = path.normalize(path.join(base, url));
        if (!filePath.startsWith(base)) {
            res.writeHead(403);
            return res.end("Forbidden");
        }
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { "Content-Type": CONTENT_TYPE_JS });
            return res.end(fs.readFileSync(filePath));
        }
        res.writeHead(404);
        return res.end("JS file not found");
    }
    if (url.startsWith(FILES_PREFIX)) {
        const file = url.split(FILES_PREFIX)[1];
        const filePath = path.normalize(path.join(FILES_DIR, file + ".fb2"));
        if (!filePath.startsWith(FILES_DIR)) {
            res.writeHead(403);
            return res.end("Forbidden");
        }
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { "Content-Type": "application/xml" });
            return res.end(fs.readFileSync(filePath));
        }
        res.writeHead(404);
        return res.end("File not found");
    }

    const routes = [
        ["GET", "/",          		HomeController.index],
        ["GET", "/books",     		BookController.index],
	["GET", "/import",    		ImportController.run],
        ["GET", "/book/:id",  		BookController.show],

        ["GET", "/authors",   		AuthorController.index],
        ["GET", "/author/:id",		AuthorController.show],
        ["GET", "/author/:id/books", 	AuthorController.books],

        ["GET", "/genres",    		GenreController.index],
        ["GET", "/genre/:id", 		GenreController.show],
        ["GET", "/genre/:id/books", 	GenreController.books],

        ["GET", "/series",    		SerieController.index],
        ["GET", "/serie/:id", 		SerieController.show],
        ["GET", "/serie/:id/books", 	SerieController.books],

        ["GET", "/db",        		DbController.dump],
        ["GET", "/db/:name",  		DbController.table],
        ["GET", "/db-stats",  		DbController.stats],
        ["GET", "/db-schema", 		DbController.schema],
        ["GET", "/db-clean",  		DbController.clean],    
    ];

    let pathMatched = false;
    for (const [method, route, handler] of routes) {
        const params = match(url, route);
        if (params) {
            pathMatched = true;
            if (req.method === method) {
                return handler(req, res, params);
            }
        }
    }
    if (pathMatched) {
        res.writeHead(405);
        return res.end("Method Not Allowed");
    }

    res.writeHead(404);
    res.end("404 Not Found");
}

module.exports = router;