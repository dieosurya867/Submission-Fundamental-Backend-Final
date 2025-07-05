const routes = require("./routes");

const AlbumsHandler = require("./handler");

module.exports = {
  name: "albums",
  register: async (server, { service, storageService, validator }) => {
    const albumsHandler = new AlbumsHandler(service, storageService, validator);
    server.route(routes(albumsHandler));
  },
};