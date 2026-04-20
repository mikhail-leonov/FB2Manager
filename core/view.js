const twig = require("twig");
const path = require("path");
const fs = require("fs");

const ROOT = path.join(__dirname, "..", "views");

twig.cache(false);

function render(template, data = {}) {
    const file = path.join(ROOT, template);

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