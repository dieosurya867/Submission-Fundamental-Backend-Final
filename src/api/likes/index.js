const LikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'likes',
    version: '1.0.0',
    register: async (server, { service, albumsService }) => {
        const handler = new LikesHandler(service, albumsService);
        server.route(routes(handler));
    },
};
