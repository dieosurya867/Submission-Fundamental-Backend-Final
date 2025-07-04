class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  postPlaylistHandler = async (request, h) => {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, owner });

    const response = h.response({
      status: "success",
      message: "Playlist berhasil dibuat",
      data: { playlistId },
    });
    response.code(201);
    return response;
  };

  getPlaylistsHandler = async (request) => {
    const { id: owner } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(owner);

    return {
      status: "success",
      data: { playlists },
    };
  };

  deletePlaylistHandler = async (request) => {
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, owner);
    await this._service.deletePlaylist(id);

    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    };
  };

  postSongToPlaylistHandler = async (request, h) => {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: userId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, userId);
    await this._service.addSongToPlaylist(playlistId, songId, userId);

    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan ke playlist",
    });
    response.code(201);
    return response;
  };

  getSongsFromPlaylistHandler = async (request) => {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, userId);
    const playlist = await this._service.getPlaylistWithSongs(playlistId);

    return {
      status: "success",
      data: { playlist },
    };
  };

  deleteSongFromPlaylistHandler = async (request) => {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: userId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, userId);
    await this._service.deleteSongFromPlaylist(playlistId, songId, userId);

    return {
      status: "success",
      message: "Lagu berhasil dihapus dari playlist",
    };
  };

  getPlaylistActivitiesHandler = async (request) => {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, userId);
    const activities = await this._service.getPlaylistActivities(playlistId);

    return {
      status: "success",
      data: {
        playlistId,
        activities,
      },
    };
  };
}

module.exports = PlaylistsHandler;
