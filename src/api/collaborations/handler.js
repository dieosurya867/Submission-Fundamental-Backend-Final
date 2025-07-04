class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  postCollaborationHandler = async (request, h) => {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const userQuery = {
      text: "SELECT id FROM users WHERE id = $1",
      values: [userId],
    };
    const result = await this._playlistsService._pool.query(userQuery);
    if (!result.rowCount) {
      const NotFoundError = require("../../exceptions/NotFoundError");
      throw new NotFoundError("User tidak ditemukan");
    }

    const collaborationId = await this._collaborationsService.addCollaboration(
      playlistId,
      userId
    );

    const response = h.response({
      status: "success",
      message: "Kolaborasi berhasil ditambahkan",
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  };

  deleteCollaborationHandler = async (request) => {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: "success",
      message: "Kolaborasi berhasil dihapus",
    };
  };
}

module.exports = CollaborationsHandler;
