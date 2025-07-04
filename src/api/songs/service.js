const { Pool } = require("pg");

const NotFoundError = require("../../exceptions/NotFoundError");

const {
  mapSongDBToModel,
  mapSongSummaryDBToModel,
} = require("../../utils/index");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ id, title, year, genre, performer, duration, albumId }) {
    const query = {
      text: `
        INSERT INTO songs 
        (id, title, year, genre, performer, duration, album_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      values: [id, title, year, genre, performer, duration, albumId],
    };

    await this._pool.query(query);
  }

  async getSongs({ title, performer }) {
    let baseQuery = "SELECT id, title, performer FROM songs";

    const conditions = [];
    const values = [];

    if (title) {
      conditions.push(`LOWER(title) LIKE LOWER($${values.length + 1})`);
      values.push(`%${title}%`);
    }

    if (performer) {
      conditions.push(`LOWER(performer) LIKE LOWER($${values.length + 1})`);
      values.push(`%${performer}%`);
    }

    if (conditions.length > 0) {
      baseQuery += " WHERE " + conditions.join(" AND ");
    }

    const result = await this._pool.query({ text: baseQuery, values });

    return result.rows.map(mapSongSummaryDBToModel);
  }

  async getSongById(id) {
    const result = await this._pool.query({
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }

    return mapSongDBToModel(result.rows[0]);
  }

  async updateSongById(
    id,
    { title, year, genre, performer, duration, albumId }
  ) {
    const query = {
      text: `
        UPDATE songs SET 
        title = $1, year = $2, genre = $3, performer = $4,
        duration = $5, album_id = $6 WHERE id = $7
      `,
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui lagu. Id tidak ditemukan");
    }
  }

  async deleteSongById(id) {
    const result = await this._pool.query({
      text: "DELETE FROM songs WHERE id = $1",
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = SongsService;
