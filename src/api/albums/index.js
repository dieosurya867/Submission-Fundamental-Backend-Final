const routes = require("./routes");

const AlbumsHandler = require("./handler");

const AlbumsService = require("./service");

const { AlbumsValidator } = require("../../validator/music");

module.exports = {
  name: "albums",

  register: async (server) => {
    const service = new AlbumsService();
    const handler = new AlbumsHandler(service, AlbumsValidator);
    server.route(routes(handler));
  },
};
