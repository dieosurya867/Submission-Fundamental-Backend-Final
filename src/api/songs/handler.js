const { nanoid } = require("nanoid");
const { SongValidator } = require("../../validator/music");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsHandler {
  constructor(service) {
    this._service = service;
  }

  postSongHandler = async (request, h) => {
    SongValidator.validateSongPayload(request.payload);

    const id = `song-${nanoid(16)}`;
    const songData = { id, ...request.payload };

    await this._service.addSong(songData);

    return h
      .response({
        status: "success",
        message: "Lagu berhasil ditambahkan",
        data: { songId: id },
      })
      .code(201);
  };

  getSongsHandler = async (request) => {
    const songs = await this._service.getSongs(request.query);
    return {
      status: "success",
      data: { songs },
    };
  };

  getSongByIdHandler = async (request) => {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: "success",
      data: { song },
    };
  };

  putSongByIdHandler = async (request) => {
    SongValidator.validateSongPayload(request.payload);
    const { id } = request.params;
    await this._service.updateSongById(id, request.payload);
    return {
      status: "success",
      message: "Lagu berhasil diperbarui",
    };
  };

  deleteSongByIdHandler = async (request) => {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: "success",
      message: "Lagu berhasil dihapus",
    };
  };
}

module.exports = SongsHandler;
