const ClientError = require('../../exceptions/ClientError');

class LikesHandler {
    constructor(service, albumsService) {
        this._service = service;
        this._albumsService = albumsService;
    }

    postLikeAlbumHandler = async (request, h) => {
        const { id: userId } = request.auth.credentials;
        const { id: albumId } = request.params;

        await this._albumsService.getAlbumById(albumId);
        await this._service.likeAlbum(userId, albumId);

        const response = h.response({
            status: 'success',
            message: 'Album disukai',
        });
        response.code(201);
        return response;
    };

    deleteLikeAlbumHandler = async (request, h) => {
        const { id: userId } = request.auth.credentials;
        const { id: albumId } = request.params;

        await this._service.unlikeAlbum(userId, albumId);

        return {
            status: 'success',
            message: 'Batal menyukai album',
        };
    };

    getAlbumLikesHandler = async (request, h) => {
        const { id: albumId } = request.params;
        const { fromCache, likes } = await this._service.getAlbumLikes(albumId);

        const response = h.response({
            status: 'success',
            data: { likes },
        });

        if (fromCache) {
            response.header('X-Data-Source', 'cache');
        }

        return response;
    };
}

module.exports = LikesHandler;
