// =============================
// Constants
// =============================

const chardet = require("chardet");
const iconv = require("iconv-lite");
const { ENCODING_MAP } = require("../../core/constants");

// =============================
// Service
// =============================


function detectEncoding(buffer) {
    let encoding = chardet.detect(buffer) || "utf-8";

    encoding = encoding.toLowerCase();

    // normalize known aliases
    if (ENCODING_MAP[encoding]) {
        return ENCODING_MAP[encoding];
    }

    // fallback for partial matches
    if (encoding.includes("1251")) {
        return "windows-1251";
    }

    // final safety fallback
    if (!iconv.encodingExists(encoding)) {
        return "utf-8";
    }

    return encoding;
}

module.exports = { detectEncoding };