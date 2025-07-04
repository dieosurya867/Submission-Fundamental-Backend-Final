exports.up = (pgm) => {
  pgm.createTable("playlist_song_activities", {
    id: { type: "VARCHAR(50)", primaryKey: true },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "playlists(id)",
      onDelete: "CASCADE",
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "songs(id)",
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "users(id)",
    },
    action: { type: "TEXT", notNull: true },
    time: { type: "TIMESTAMPTZ", notNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("playlist_song_activities");
};
