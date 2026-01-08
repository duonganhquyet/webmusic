export default function PlaylistPanel() {
  // Mock data - sau này thay bằng API call
  const playlists = [
    {
      id: 1,
      name: "Chill Vibes",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      songCount: 45,
      isPublic: true
    },
    {
      id: 2,
      name: "Workout Mix",
      cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop",
      songCount: 32,
      isPublic: false
    },
    {
      id: 3,
      name: "Road Trip",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      songCount: 28,
      isPublic: true
    },
    {
      id: 4,
      name: "Study Focus",
      cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop",
      songCount: 52,
      isPublic: false
    }
  ];

  return (
    <div className="playlist-panel">
      <div className="panel-header">
        <div>
          <h3>Playlists</h3>
          <p>Danh sách playlist của bạn hoặc đã subscribe. ({playlists.length} playlists)</p>
        </div>
        <button className="create-playlist-btn">
          + Create Playlist
        </button>
      </div>

      <div className="playlist-grid">
        {playlists.map(playlist => (
          <div key={playlist.id} className="playlist-card">
            <div className="playlist-cover">
              <img src={playlist.cover} alt={playlist.name} />
              <div className="playlist-overlay">
                <button className="play-btn">▶</button>
              </div>
            </div>
            <div className="playlist-info">
              <h4>{playlist.name}</h4>
              <p>{playlist.songCount} songs</p>
              <span className="playlist-badge">
                {playlist.isPublic ? "Public" : "Private"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="empty-state">
          <p>Bạn chưa có playlist nào. Tạo playlist đầu tiên của bạn ngay!</p>
          <button className="create-playlist-btn">+ Create Playlist</button>
        </div>
      )}
    </div>
  );
}