const chardet = require("chardet");
const iconv = require("iconv-lite");

function detectEncoding(buffer) {
    let encoding = chardet.detect(buffer) || "utf-8";
    encoding = encoding.toLowerCase();
    if (encoding.includes("windows-1251") || encoding.includes("cp1251")) {
        encoding = "win1251";
    }
    return encoding;
}

module.exports = { detectEncoding };