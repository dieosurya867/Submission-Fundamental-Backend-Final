

class ExportsHandler {
    constructor(service, playlistsService, validator) {
        this._service = service;
        this._playlistsService = playlistsService;
        this._validator = validator;
    }

    postExportPlaylistHandler = async (request, h) => {
        try {
            this._validator.validateExportPayload(request.payload);
            const { targetEmail } = request.payload;
            const { id: playlistId } = request.params;
            const { id: userId } = request.auth.credentials;

            console.log('[Handler] Payload:', { playlistId, targetEmail, userId });

            await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
            console.log('[Handler] Playlist ownership verified');

            const message = { playlistId, targetEmail };
            await this._service.sendMessage(message);
            console.log('[Handler] Message sent to queue:', message);

            const response = h.response({
                status: 'success',
                message: 'Permintaan Anda sedang kami proses',
            });
            response.code(201);
            return response;
        } catch (error) {
            console.error('[Handler] Error:', error.message);
            throw error;
        }
    }
}

module.exports = ExportsHandler;
