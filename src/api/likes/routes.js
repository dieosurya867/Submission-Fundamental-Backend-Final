const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums/{id}/likes',
        options: {
            auth: 'openmusic_jwt',
            handler: handler.postLikeAlbumHandler,
        },
    },
    {
        method: 'DELETE',
        path: '/albums/{id}/likes',
        options: {
            auth: 'openmusic_jwt',
            handler: handler.deleteLikeAlbumHandler,
        },
    },
    {
        method: 'GET',
        path: '/albums/{id}/likes',
        handler: handler.getAlbumLikesHandler,
    },
];

module.exports = routes;
