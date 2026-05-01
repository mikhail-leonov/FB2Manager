// =============================
// Constants
// =============================

const { XMLParser } = require("fast-xml-parser");
const iconv = require("iconv-lite");
const { detectEncoding } = require("./encoding");
const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true
});


// =============================
// Service
// =============================

function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(node) {
    if (typeof node === "string") {
        return escapeHtml(node);
    }
    if (!node || typeof node !== "object") {
        return "";
    }
    let html = "";
    for (const key in node) {
        const value = node[key];

        if (key === "#text") {
            html += escapeHtml(value);
        }

        else if (key === "strong") {
            const arr = Array.isArray(value) ? value : [value];
            html += arr.map(v => `<strong>${renderInline(v)}</strong>`).join("");
        }

        else if (key === "emphasis") {
            const arr = Array.isArray(value) ? value : [value];
            html += arr.map(v => `<em>${renderInline(v)}</em>`).join("");
        }

        else if (key === "a") {
            const arr = Array.isArray(value) ? value : [value];
            html += arr.map(v => {
                const href = v?.["@_xlink:href"] || "#";
                return `<a href="${href}">${renderInline(v)}</a>`;
            }).join("");
        }

        else {
            // fallback
            if (Array.isArray(value)) {
                html += value.map(renderInline).join("");
            } else {
                html += renderInline(value);
            }
        }
    }

    return html;
}

function nodesToHtml(node) {
    if (!node) return "";

    let html = "";

    for (const key in node) {
        const value = node[key];

        // =========================
        // SECTION
        // =========================
        if (key === "section") {
            const arr = Array.isArray(value) ? value : [value];
            html += arr.map(v => `<section class="log-line resolution-skipped">${nodesToHtml(v)}</section>`).join("");
        }

        // =========================
        // TITLE
        // =========================
        else if (key === "title") {
            const arr = Array.isArray(value) ? value : [value];
            html += arr.map(v => `<h2 class="log-line resolution-skipped">${renderInline(v)}</h2>`).join("");
        }

        // =========================
        // SUBTITLE
        // =========================
        else if (key === "subtitle") {
            const arr = Array.isArray(value) ? value : [value];
            html += arr.map(v => `<h3 class="log-line resolution-skipped">${renderInline(v)}</h3>`).join("");
        }

        // =========================
        // PARAGRAPH
        // =========================
        else if (key === "p") {
            const arr = Array.isArray(value) ? value : [value];
            html += arr.map(v => `<p class="log-line resolution-skipped">${renderInline(v)}</p>`).join("");
        }

        // =========================
        // POEM
        // =========================
        else if (key === "poem") {
            const arr = Array.isArray(value) ? value : [value];
            html += arr.map(v => `<div class="poem log-line resolution-skipped">${nodesToHtml(v)}</div>`).join("");
        }

        else if (key === "stanza") {
            const arr = Array.isArray(value) ? value : [value];
            html += arr.map(v => `<div class="stanza log-line resolution-skipped">${nodesToHtml(v)}</div>`).join("");
        }

        else if (key === "v") {
            const arr = Array.isArray(value) ? value : [value];
            html += arr.map(v => `<div class="verse log-line resolution-skipped">${renderInline(v)}</div>`).join("");
        }

        // =========================
        // IMAGE (basic)
        // =========================
        else if (key === "image") {
//            const arr = Array.isArray(value) ? value : [value];
//            html += arr.map(v => {
//                const href = v?.["@_xlink:href"] || "";
//                return `<img src="${href}" alt="">`;
//            }).join("");
        }

        // =========================
        // UNKNOWN → recurse
        // =========================
        else {
            if (Array.isArray(value)) {
                html += value.map(nodesToHtml).join("");
            } else if (typeof value === "object") {
                html += nodesToHtml(value);
            }
        }
    }

    return html;
}

function renderFb2ToHtml(buffer) {
    const encoding = detectEncoding(buffer);
    const xml = iconv.decode(buffer, encoding);

    const json = parser.parse(xml);

    const body = json?.FictionBook?.body;
    if (!body) return "<p class='log-line resolution-skipped'>No content found.</p>";

    const bodies = Array.isArray(body) ? body : [body];
    return bodies.map(b => nodesToHtml(b)).join("\n");
}


module.exports = { renderFb2ToHtml };