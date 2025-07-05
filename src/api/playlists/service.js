const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsService {
  constructor(collaborationsService, activitiesService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._activitiesService = activitiesService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3)",
      values: [id, name, owner],
    };
    await this._pool.query(query);
    return id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `
        SELECT p.id, p.name, u.username
        FROM playlists p
        LEFT JOIN collaborations c ON p.id = c.playlist_id
        JOIN users u ON u.id = p.owner
        WHERE p.owner = $1 OR c.user_id = $1
        GROUP BY p.id, u.username
      `,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylist(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
    }
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Playlist tidak ditemukan');

    const playlist = result.rows[0];
    if (playlist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      await this._collaborationsService.verifyCollaborator(playlistId, userId);
    }
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const songQuery = {
      text: "SELECT id FROM songs WHERE id = $1",
      values: [songId],
    };
    const songResult = await this._pool.query(songQuery);
    if (!songResult.rowCount) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }
    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3)",
      values: [id, playlistId, songId],
    };
    await this._pool.query(query);

    await this._activitiesService.addActivity({
      playlistId,
      songId,
      userId,
      action: "add",
    });
  }

  //Playlist with song

  async getPlaylistWithSongs(playlistId) {
    const playlistQuery = {
      text: `
        SELECT p.id, p.name, u.username
        FROM playlists p
        JOIN users u ON p.owner = u.id
        WHERE p.id = $1
      `,
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const songsQuery = {
      text: `
        SELECT s.id, s.title, s.performer
        FROM playlist_songs ps
        JOIN songs s ON ps.song_id = s.id
        WHERE ps.playlist_id = $1
      `,
      values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);

    return {
      ...playlistResult.rows[0],
      songs: songsResult.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2",
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Lagu gagal dihapus. Data tidak ditemukan");
    }

    await this._activitiesService.addActivity({
      playlistId,
      songId,
      userId,
      action: "delete",
    });
  }

  // go to playlist_song_activities function

  async getPlaylistActivities(playlistId) {
    return await this._activitiesService.getActivities(playlistId);
  }
}

module.exports = PlaylistsService;
