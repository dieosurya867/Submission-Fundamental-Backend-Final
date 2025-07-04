const PlaylistsHandler = require("./handler");
const routes = require("./routes");
const PlaylistsService = require("./service");

const CollaborationsService = require("../collaborations/service");
const ActivitiesService = require("../activities/service");

const { PlaylistsValidator } = require("../../validator/playlists");

module.exports = {
  name: "playlists",
  register: async (server) => {
    const collaborationsService = new CollaborationsService();
    const activitiesService = new ActivitiesService();

    const playlistsService = new PlaylistsService(
      collaborationsService,
      activitiesService
    );

    const handler = new PlaylistsHandler(playlistsService, PlaylistsValidator);

    server.route(routes(handler));
  },
};
