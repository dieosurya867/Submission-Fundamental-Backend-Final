const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async likeAlbum(userId, albumId) {
        const check = await this._pool.query({
            text: 'SELECT 1 FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        });
        if (check.rowCount > 0) {
            throw new InvariantError('Album sudah disukai');
        }

        const id = `like-${nanoid(16)}`;
        await this._pool.query({
            text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3)',
            values: [id, userId, albumId],
        });

        await this._cacheService.delete(`album_likes:${albumId}`);
    }

    async unlikeAlbum(userId, albumId) {
        const result = await this._pool.query({
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        });

        if (!result.rowCount) {
            throw new InvariantError('Like tidak ditemukan');
        }

        await this._cacheService.delete(`album_likes:${albumId}`);
    }

    async getAlbumLikes(albumId) {
        try {
            const result = await this._cacheService.get(`album_likes:${albumId}`);
            return { fromCache: true, likes: JSON.parse(result) };
        } catch (error) {
            const result = await this._pool.query({
                text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            });

            const count = parseInt(result.rows[0].count, 10);
            await this._cacheService.set(`album_likes:${albumId}`, JSON.stringify(count), 1800);
            return { fromCache: false, likes: count };
        }
    }
}

module.exports = LikesService;