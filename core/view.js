const twig = require("twig");
const path = require("path");
const fs = require("fs");

const { VIEWS_DIR } = require("./constants");

twig.cache(false);

function render(template, data = {}) {
    const file = path.join(VIEWS_DIR, template);

    if (!fs.existsSync(file)) {
        throw new Error("View not found: " + template);
    }

    return new Promise((resolve, reject) => {
        twig.renderFile(file, data, (err, html) => {
            if (err) return reject(err);
            resolve(html);
        });
    });
}

module.exports = { render };