import { useEffect, useState } from "react";
import PlaylistCreateModal from "./PlaylistCreateModal.jsx";
import PlaylistTracksModal from "./PlaylistTracksModal.jsx";
import { createUserPlaylist, fetchUserPlaylists } from "../../../../services/api.js";

export default function PlaylistPanel() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetchUserPlaylists();
        if(res && res.data) {
          setPlaylists(res.data || []);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="playlist-panel">
      <div className="panel-header">
        <div>
          <h3>Playlists</h3>
          {!loading && !error && (
            <p>Danh sách playlist của bạn hoặc đã subscribe. ({playlists.length} playlists)</p>
          )}
        </div>
        <button className="create-playlist-btn" onClick={() => setShowCreate(true)}>
          + Create Playlist
        </button>
      </div>

      {loading && <p>Loading playlists...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="playlist-grid">
            {playlists.map(pl => (
              <div key={pl?._id} className="playlist-card" onClick={() => setActivePlaylist(pl)}>
                <div className="playlist-cover">
                  <img src={pl?.imgUrl || "https://via.placeholder.com/300"} alt={pl?.title} />
                  <div className="playlist-overlay">
                    <button className="play-btn">▶</button>
                  </div>
                </div>
                <div className="playlist-info">
                  <h4>{pl?.title}</h4>
                  <p>{(pl?.tracks?.length || 0)} songs</p>
                  <span className="playlist-badge">
                    {pl?.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {playlists.length === 0 && (
            <div className="empty-state">
              <p>Bạn chưa có playlist nào. Tạo playlist đầu tiên của bạn ngay!</p>
              <button className="create-playlist-btn" onClick={() => setShowCreate(true)}>+ Create Playlist</button>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <PlaylistCreateModal
          onClose={() => setShowCreate(false)}
          onSubmit={async (payload) => {
            try {
              const res = await createUserPlaylist(payload);
              if(res && res.data) {
                alert("Playlist created successfully");
                setShowCreate(false);
                setPlaylists(prev => [res.data.playlist, ...prev]);
              }
              
            } catch (err) {
              setError(err.message);
            }
          }}
        />
      )}

      {activePlaylist && (
        <PlaylistTracksModal
          playlist={activePlaylist}
          onClose={() => setActivePlaylist(null)}
        />
      )}
    </div>
  );
}