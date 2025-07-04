const CollaborationsHandler = require("./handler");
const routes = require("./routes");
const CollaborationsService = require("./service");
const { CollaborationsValidator } = require("../../validator/collaborations");
const PlaylistsService = require("../playlists/service");

module.exports = {
  name: "collaborations",
  register: async (server) => {
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService();

    const handler = new CollaborationsHandler(
      collaborationsService,
      playlistsService,
      CollaborationsValidator
    );

    server.route(routes(handler));
  },
};
