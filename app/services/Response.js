// =============================
// Constants
// =============================


const { render } = require("../../core/view");
const {
    CONTENT_TYPE_JSON,
    CONTENT_TYPE_HTML
} = require("../../core/constants");
const { renderTable, renderJson } = require("./ViewTable");

// =============================
// Service
// =============================

function getUrl(req) {
    return new URL(req.url, `http://${req.headers.host}`);
}

async function respond(
    req,
    res,
    title,
    data,
    isTable = false,
    hiddenColumns = [],
    pagination = null
) {
    const url = getUrl(req);
    const asJson = url.searchParams.get("json");

    if (asJson) {
        res.writeHead(200, { "Content-Type": CONTENT_TYPE_JSON });
        return res.end(JSON.stringify(data, null, 2));
    }

    const isTableData = Array.isArray(data) && data.length && typeof data[0] === "object";

    let content =
        (isTableData && isTable)
            ? renderTable(data, hiddenColumns, url)  // Pass url for sorting
            : renderJson(data);

    const html = await render("page.twig", {
        title,
        content,
        path: url.pathname,
        page: pagination?.page || 1,
        limit: pagination?.limit || null,
        hasNext: pagination?.hasNext || false,
        hasPrev: pagination?.hasPrev || false,
        sort: url.searchParams.get("sort") || "",
        order: url.searchParams.get("order") || ""
    });

    res.writeHead(200, { "Content-Type": CONTENT_TYPE_HTML });
    res.end(html);
}

function error(res, msg, code = 400) {
    res.writeHead(code);
    res.end(msg);
}

module.exports = {
    respond,
    error,
    getUrl
};