
class ExportsHandler {
    constructor(service, playlistsService, validator) {
        this._service = service;
        this._playlistsService = playlistsService;
        this._validator = validator;
    }

    async postExportPlaylistHandler(request, h) {
        this._validator.validateExportPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;
        const { playlistId } = request.params;
        const { targetEmail } = request.payload;

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

        const message = {
            playlistId,
            targetEmail,
        };
        await this._service.sendMessage('export:playlists', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan ekspor playlist dalam antrean',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;
