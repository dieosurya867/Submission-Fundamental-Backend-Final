const routes = (handler) => [
  {
    method: "POST",
    path: "/albums",
    handler: handler.postAlbumHandler,
  },
  {
    method: "GET",
    path: "/albums/{id}",
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: "PUT",
    path: "/albums/{id}",
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: "DELETE",
    path: "/albums/{id}",
    handler: handler.deleteAlbumByIdHandler,
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    options: {
      payload: {
        allow: "multipart/form-data",
        maxBytes: 512000,
        output: 'stream',
        multipart: true,
        output: "stream",
      },
      handler: handler.postUploadAlbumCoverHandler,
    },
  },

];

module.exports = routes;
