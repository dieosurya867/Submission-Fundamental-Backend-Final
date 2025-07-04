const mapSongDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration: duration ?? null,
  albumId: album_id ?? null,
});

const mapSongSummaryDBToModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mapAlbumDBToModel = ({ id, name, year, cover_url }) => ({
  id,
  name,
  year,
  coverUrl: cover_url ?? null,
});

module.exports = {
  mapSongDBToModel,
  mapSongSummaryDBToModel,
  mapAlbumDBToModel,
};
