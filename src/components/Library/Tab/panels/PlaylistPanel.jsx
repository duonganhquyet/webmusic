import { useEffect, useState } from "react";
import PlaylistCreateModal from "./PlaylistCreateModal.jsx";
import PlaylistTracksModal from "./PlaylistTracksModal.jsx";
import { createUserPlaylist, fetchUserPlaylists, uploadPlaylistCover } from "../../../../services/api.js";
import { notifyError, notifySuccess, notifyWarning } from "../../../../utils/notification";
import { resolveAssetUrl } from "../../../../utils/url";

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

  // Listen for added track events to update counts in real-time
  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {};
      const pid = detail.playlistId || detail.playlist?._id || detail.playlist?.id;
      const updatedPlaylist = detail.playlist;
      if (!pid) return;

      setPlaylists((prev) => prev.map((p) => {
        const id = p._id || p.id;
        if (String(id) !== String(pid)) return p;
        if (updatedPlaylist && Array.isArray(updatedPlaylist.tracks)) {
          // Replace tracks with fresh array from server
          return { ...p, tracks: updatedPlaylist.tracks };
        }
        // Fallback: increment count locally
        if (Array.isArray(p.tracks)) {
          return { ...p, tracks: [...p.tracks, { track: 'added', addedAt: new Date() }] };
        }
        return { ...p, tracksCount: (p.tracksCount || 0) + 1 };
      }));
    };
    window.addEventListener('playlist:track-added', handler);
    return () => window.removeEventListener('playlist:track-added', handler);
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
                  <img src={resolveAssetUrl(pl?.imgUrl) || "/default-cover.png"} alt={pl?.title} />
                  <div className="playlist-overlay">
                    <button className="play-btn">▶</button>
                  </div>
                </div>
                <div className="playlist-info">
                  <h4>{pl?.title}</h4>
                  <p>{(pl?.tracks?.length || pl?.tracksCount || 0)} songs</p>
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
          onSubmit={async (payload, file) => {
            try {
              const res = await createUserPlaylist(payload);
              if(res && res.data) {
                let playlist = res.data.playlist || res.data;

                // If file selected, upload cover
                if (file && playlist?._id) {
                  const formData = new FormData();
                  formData.append('cover', file);
                  try {
                    const coverRes = await uploadPlaylistCover(playlist._id, formData);
                    if (coverRes && coverRes.data) {
                      playlist = coverRes.data;
                    }
                  } catch (e) {
                    notifyWarning('Playlist', 'Tạo playlist thành công nhưng upload ảnh bìa thất bại');
                  }
                }

                notifySuccess('Playlist', 'Tạo playlist thành công');
                setShowCreate(false);
                setPlaylists(prev => [playlist, ...prev]);
              } else {
                notifyError('Playlist', 'Tạo playlist thất bại');
              }
              
            } catch (err) {
              setError(err.message);
              notifyError('Playlist', err.message || 'Có lỗi xảy ra');
            }
          }}
        />
      )}

      {activePlaylist && (
        <PlaylistTracksModal
          playlist={activePlaylist}
          onClose={() => setActivePlaylist(null)}
          onDeleted={(id) => {
            setPlaylists(prev => prev.filter(p => (p._id || p.id) !== id));
            setActivePlaylist(null);
          }}
          onUpdated={(pl) => {
            setPlaylists(prev => prev.map(p => ((p._id||p.id) === (pl._id||pl.id) ? { ...p, ...pl } : p)));
          }}
        />
      )}
    </div>
  );
}