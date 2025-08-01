require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const Inert = require("@hapi/inert");

const ClientError = require("./exceptions/ClientError");

const users = require("./api/users");
const albums = require("./api/albums");
const songs = require("./api/songs");
const authentications = require("./api/authentications");
const playlists = require("./api/playlists");
const collaborations = require("./api/collaborations");
const activities = require("./api/activities");
const exportsPlugin = require('./api/exports');
const likes = require('./api/likes');

// uploads
const AlbumsService = require("./api/albums/service");
const StorageService = require("./storage/service");
const MusicValidator = require("./validator/music");

//Export
const ExportService = require("./api/exports/service")
const PlaylistsService = require('./api/playlists/service');
const { ExportsValidator } = require('./validator/exports');
const CollaborationsService = require("./api/collaborations/service")
const ActivitiesService = require("./api/activities/service")

//Likes
const LikesService = require('./api/likes/service');

// Cache
const CacheService = require('./redis/CacheService');

const path = require("path");

const init = async () => {
  const albumsService = new AlbumsService();
  const exportService = new ExportService();
  const collaborationsService = new CollaborationsService();
  const activitiesService = new ActivitiesService();
  const playlistsService = new PlaylistsService(collaborationsService, activitiesService);
  const cacheService = new CacheService();
  const likesService = new LikesService(cacheService);
  const storageService = new StorageService(
    path.resolve(__dirname, "api/uploads/file/images")
  );
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: { origin: ["*"] },
    },
  });

  await server.register([{ plugin: Jwt }, { plugin: Inert }, { plugin: activities }]);

  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: { id: artifacts.decoded.payload.id },
    }),
  });

  await server.register([
    {
      plugin: users,
    },
    {
      plugin: authentications,
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        storageService: storageService,
        validator: MusicValidator,
      },
    },
    {
      plugin: songs,
    },
    {
      plugin: collaborations,
    },
    {
      plugin: playlists,
      options: {
        activitiesService: server.app.activitiesService,
      },
    },
    {
      plugin: exportsPlugin,
      options: {
        service: exportService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: likes,
      options: {
        service: likesService,
        albumsService: albumsService,
      },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response.isBoom && response.output.statusCode === 415) {
      const newResponse = h.response({
        status: 'fail',
        message: 'Format file tidak didukung. Harap unggah file gambar yang didukung.',
      });
      newResponse.code(400);
      return newResponse;
    }

    if (response.isBoom && response.output.statusCode === 413) {
      const newResponse = h.response({
        status: 'fail',
        message: 'Ukuran file terlalu besar. Maksimal 512KB.',
      });
      newResponse.code(413);
      return newResponse;
    }

    if (response.isBoom) {
      const { statusCode, payload } = response.output;
      if (statusCode >= 400 && statusCode < 500) {
        return h
          .response({
            status: "fail",
            message: payload.message,
          })
          .code(statusCode);
      }
      return h
        .response({
          status: "error",
          message: "Terjadi kesalahan pada server",
        })
        .code(500);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
