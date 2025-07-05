

class ExportsHandler {
    constructor(service, playlistsService, validator) {
        this._service = service;
        this._playlistsService = playlistsService;
        this._validator = validator;
    }

    postExportPlaylistHandler = async (request, h) => {
        this._validator.validateExportPayload(request.payload);
        const { targetEmail } = request.payload;
        const { id: playlistId } = request.params;
        const { id: ownerId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

        const message = {
            playlistId,
            targetEmail,
        };

        await this._service.sendMessage(message);

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;
