const { respond } = require("../services/Response");

class HomeController {
    static async index(req, res) {
        return respond(req, res, "My FB2 Collection", {
            message: "Welcome to your FB2 library"
        });
    }
}

module.exports = HomeController;