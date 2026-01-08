import { useEffect, useState } from "react";
import "./PlaylistTracksModal.css";
import { Link } from "react-router-dom";
import { fetchPlaylistTracks, updatePlaylistInfo, deletePlaylist } from "../../../../services/api";
import { notifyError, notifySuccess } from "../../../../utils/notification";
import { resolveAssetUrl } from "../../../../utils/url";

export default function PlaylistTracksModal({ playlist, onClose, onDeleted, onUpdated }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: playlist.title || "",
    description: playlist.description || "",
    isPublic: !!playlist.isPublic,
  });

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
          <h3 style={{ margin: 0 }}>{playlist.title}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn secondary" onClick={() => setEditing((e) => !e)}>{editing ? 'Hủy' : 'Sửa'}</button>
            <button className="btn danger" onClick={async () => {
              const ok = confirm('Xóa playlist này? Hành động không thể hoàn tác.');
              if (!ok) return;
              try {
                const res = await deletePlaylist(playlist._id);
                if (res && res.statusCode === 200) {
                  notifySuccess('Playlist', 'Đã xóa playlist');
                  onDeleted?.(playlist._id);
                } else {
                  notifyError('Playlist', res?.message || 'Xóa playlist thất bại');
                }
              } catch (err) {
                notifyError('Playlist', err.message || 'Xóa playlist thất bại');
              }
            }}>Xóa</button>
            <button className="playlist-modal__close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {editing && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #333' }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <label>
                <span style={{ display: 'block', marginBottom: 4 }}>Tên</span>
                <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: 4 }}>Mô tả</span>
                <textarea rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm(f => ({ ...f, isPublic: e.target.checked }))} />
                <span>Public</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn primary" onClick={async () => {
                  try {
                    const res = await updatePlaylistInfo(playlist._id, {
                      title: form.title.trim(),
                      description: form.description.trim(),
                      isPublic: !!form.isPublic,
                    });
                    if (res && res.data) {
                      notifySuccess('Playlist', 'Đã cập nhật playlist');
                      setEditing(false);
                      onUpdated?.(res.data);
                    } else {
                      notifyError('Playlist', res?.message || 'Cập nhật thất bại');
                    }
                  } catch (err) {
                    notifyError('Playlist', err.message || 'Cập nhật thất bại');
                  }
                }}>Lưu</button>
                <button className="btn secondary" onClick={() => setEditing(false)}>Hủy</button>
              </div>
            </div>
          </div>
        )}

        {loading && <div className="loading">Loading songs...</div>}
        {error && <div className="error-text">{error}</div>}

        {!loading && !error && (
          <div className="song-tiles">
            {songs.map(s => {
              const sid = s.id || s._id;
              return (
                <Link
                  key={sid}
                  to={`/track/${sid}`}
                  className="song-tile"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="song-cover">
                    <img src={resolveAssetUrl(s.imgUrl) || "https://via.placeholder.com/300"} alt={s.title || 'Track'} />
                  </div>
                  <div className="song-title">{s.title || 'Untitled'}</div>
                </Link>
              );
            })}
            {songs.length === 0 && (
              <div className="empty-state">Playlist này chưa có bài hát.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
