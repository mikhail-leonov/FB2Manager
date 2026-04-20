const { render } = require("../../core/view");

class HomeController {
    static async index(req, res) {
        const html = await render("page.twig", { title: "My FB2 Collection", content: "" });
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
    }
}

module.exports = HomeController;