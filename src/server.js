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

const init = async () => {
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

    // if (response.isBoom && response.output.statusCode === 415) {
    //   const newResponse = h.response({
    //     status: 'fail',
    //     message: 'Format file tidak didukung. Harap unggah gambar JPG atau PNG.',
    //   });
    //   newResponse.code(400);
    //   return newResponse;
    // }

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
