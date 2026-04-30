const { render } = require("../../core/view");

async function renderBookPage(res, book) {

    const html = await render("meta.twig", { title: book.title || book.Title, book_id: book.book_id, book });
    res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
    });
    return res.end(html);
}

module.exports = { renderBookPage };