const { Pool } = require("pg");

const NotFoundError = require("../../exceptions/NotFoundError");

const {
  mapAlbumDBToModel,
  mapSongSummaryDBToModel,
} = require("../../utils/index");

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ id, name, year }) {
    const query = {
      text: "INSERT INTO albums (id, name, year, cover_url) VALUES ($1, $2, $3, $4)",
      values: [id, name, year, null],
    };
    await this._pool.query(query);
  }

  async getAlbumById(id) {
    const result = await this._pool.query({
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError("Album Tidak Ditemukan");
    }

    return mapAlbumDBToModel(result.rows[0]);
  }

  async getSongsInAlbum(albumId) {
    const result = await this._pool.query({
      text: "SELECT id, title, performer FROM songs WHERE album_id = $1",
      values: [albumId],
    });

    return result.rows.map(mapSongSummaryDBToModel);
  }

  async updateAlbumById(id, { name, year }) {
    const result = await this._pool.query({
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3",
      values: [name, year, id],
    });

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const result = await this._pool.query({
      text: "DELETE FROM albums WHERE id = $1",
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError("Gagal menghapus album. ID tidak ditemukan");
    }
  }

  async updateCoverAlbumById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
