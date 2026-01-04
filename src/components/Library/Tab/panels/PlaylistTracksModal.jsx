import { useEffect, useState } from "react";
import "./PlaylistTracksModal.css";
import { fetchPlaylistTracks } from "../../../../services/api";

export default function PlaylistTracksModal({ playlist, onClose }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchSongs = async () => {
      try {
        const res = await fetchPlaylistTracks(playlist._id);
        if(res && res.data){
          setSongs(res.data.songs || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [playlist._id]);

  return (
    <div className="playlist-modal-overlay" role="dialog" aria-modal="true">
      <div className="playlist-tracks-modal">
        <div className="playlist-modal__header">
          <h3>{playlist.title}</h3>
          <button className="playlist-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {loading && <div className="loading">Loading songs...</div>}
        {error && <div className="error-text">{error}</div>}

        {!loading && !error && (
          <div className="song-tiles">
            {songs.map(s => (
              <div key={s.id || s._id} className="song-tile">
                <div className="song-cover">
                  <img src={s.imgUrl || "https://via.placeholder.com/300"} alt={s.title} />
                </div>
                <div className="song-title">{s.title}</div>
              </div>
            ))}
            {songs.length === 0 && (
              <div className="empty-state">Playlist này chưa có bài hát.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
