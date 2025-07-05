const { nanoid } = require("nanoid");
const path = require('path');
const fs = require('fs');

const { AlbumValidator } = require("../../validator/music");
const ClientError = require('../../exceptions/ClientError');


class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
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

  postUploadImageHandler = async (request, h) => {
    const { cover } = request.payload;
    const { id: albumId } = request.params;

    this._validator.validateImageHeaders(cover.hapi.headers);
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._service.updateCoverAlbumById(albumId, fileLocation);

    const response = h.response({
      status: "success",
      data: {
        fileLocation,
      },
    });
    response.code(201);
    return response;
  };
}

module.exports = AlbumsHandler;