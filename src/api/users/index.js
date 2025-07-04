const UsersHandler = require("./handler");
const routes = require("./routes");
const UsersService = require("./service");
const { UsersValidator } = require("../../validator/users");

module.exports = {
  name: "users",
  register: async (server) => {
    const service = new UsersService();
    const handler = new UsersHandler(service, UsersValidator);
    server.route(routes(handler));
  },
};
