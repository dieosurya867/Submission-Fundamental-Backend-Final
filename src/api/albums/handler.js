const { nanoid } = require("nanoid");

const { AlbumValidator } = require("../../validator/music");

class AlbumsHandler {
  constructor(service) {
    this._service = service;
  }

  postAlbumHandler = async (request, h) => {
    AlbumValidator.validateAlbumPayload(request.payload);

    const id = `album-${nanoid(16)}`;
    const { name, year } = request.payload;

    await this._service.addAlbum({ id, name, year });

    return h
      .response({
        status: "success",
        message: "Album berhasil ditambahkan",
        data: { albumId: id },
      })
      .code(201);
  };

  getAlbumByIdHandler = async (request, h) => {
    const { id } = request.params;

    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongsInAlbum(id);

    album.songs = songs;

    return {
      status: "success",
      data: { album },
    };
  };

  putAlbumByIdHandler = async (request, h) => {
    AlbumValidator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.updateAlbumById(id, { name, year });

    return {
      status: "success",
      message: "Album berhasil diperbarui",
    };
  };

  deleteAlbumByIdHandler = async (request, h) => {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    return {
      status: "success",
      message: "Data Berhasil Dihapus",
    };
  };
}

module.exports = AlbumsHandler;
