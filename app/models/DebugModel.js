const db = require("../../core/db");
const crypto = require("crypto");
const { pagedQuery } = require("../../core/dbpagination");

class DebugModel {
    static getAll(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);
	return pagedQuery({ table: "Authors", page, limit });
    }
}

module.exports = DebugModel;