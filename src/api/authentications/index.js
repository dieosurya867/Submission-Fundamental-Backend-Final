const AuthenticationsHandler = require("./handler");
const routes = require("./routes");
const AuthenticationsService = require("./service");
const TokenManager = require("../../tokenize/TokenManager");
const { AuthenticationsValidator } = require("../../validator/authentications");
const UsersService = require("../users/service");

module.exports = {
  name: "authentications",
  register: async (server) => {
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const handler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      TokenManager,
      AuthenticationsValidator
    );

    server.route(routes(handler));
  },
};
