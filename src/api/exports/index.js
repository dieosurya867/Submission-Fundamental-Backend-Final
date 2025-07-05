const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'exports',
    register: async (server, { service, playlistsService, validator }) => {
        const handler = new ExportsHandler(service, playlistsService, validator);
        server.route(routes(handler));
    },
};
