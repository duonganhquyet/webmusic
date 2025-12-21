export default function AlbumPanel() {
  // Mock data - sau này thay bằng API call
  const albums = [
    {
      id: 1,
      title: "Midnight Dreams",
      artist: "The Dreamers",
      cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
      year: 2024,
      tracks: 12
    },
    {
      id: 2,
      title: "Summer Vibes",
      artist: "Beach Boys Revival",
      cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
      year: 2023,
      tracks: 10
    },
    {
      id: 3,
      title: "Urban Stories",
      artist: "City Lights",
      cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
      year: 2024,
      tracks: 15
    },
    {
      id: 4,
      title: "Acoustic Sessions",
      artist: "Solo Artist",
      cover: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop",
      year: 2023,
      tracks: 8
    }
  ];

  return (
    <div className="album-panel">
      <h3>Albums</h3>
      <p>Album bạn đã upload hoặc lưu. ({albums.length} albums)</p>

      <div className="album-grid">
        {albums.map(album => (
          <div key={album.id} className="album-card">
            <div className="album-cover">
              <img src={album.cover} alt={album.title} />
              <div className="album-overlay">
                <button className="play-btn">▶</button>
              </div>
            </div>
            <div className="album-info">
              <h4>{album.title}</h4>
              <p className="album-artist">{album.artist}</p>
              <p className="album-meta">{album.year} • {album.tracks} tracks</p>
            </div>
          </div>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="empty-state">
          <p>Bạn chưa có album nào trong thư viện. Hãy khám phá và lưu những album yêu thích!</p>
        </div>
      )}
    </div>
  );
}