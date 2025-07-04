const routes = require("./routes");

const SongsHandler = require("./handler");

const SongsService = require("./service");

module.exports = {
  name: "songs",

  register: async (server) => {
    const service = new SongsService();
    const handler = new SongsHandler(service);
    server.route(routes(handler));
  },
};
