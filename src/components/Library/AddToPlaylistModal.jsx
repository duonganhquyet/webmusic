import { useEffect, useState } from "react";
import { fetchUserPlaylists, createUserPlaylist, addTrackToPlaylist } from "../../services/api";
import { notifyError, notifySuccess, notifyWarning } from "../../utils/notification";

export default function AddToPlaylistModal({ trackId, onClose, onAdded }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [mode, setMode] = useState("existing"); // existing | new
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchUserPlaylists();
        if (res && res.data) {
          const list = res.data || [];
          setPlaylists(Array.isArray(list) ? list : []);
          if (list.length > 0) setSelectedId(list[0]._id || list[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    try {
      if (mode === "existing") {
        if (!selectedId) return notifyWarning("Playlist", "Chọn playlist để thêm bài hát");
        // Check duplicate locally to avoid unnecessary API call
        try {
          const tracksRes = await fetchPlaylistTracks(selectedId);
          const songs = tracksRes?.data?.songs || tracksRes?.songs || [];
          const exists = songs.some(s => (s.id || s._id) === trackId);
          if (exists) {
            notifySuccess("Playlist", "Bài hát đã có trong playlist");
            onAdded?.(selectedId);
            onClose?.();
            return;
          }
        } catch {}

        const res = await addTrackToPlaylist(selectedId, trackId);
        if (res && (res.statusCode === 200 || res.success)) {
          notifySuccess("Playlist", "Đã thêm vào playlist");
          onAdded?.(selectedId);
          // Emit event so Playlist tab updates immediately
          try {
            const updated = res?.data || res?.playlist;
            window.dispatchEvent(new CustomEvent('playlist:track-added', { detail: { playlistId: selectedId, playlist: updated } }));
          } catch {}
          onClose?.();
        } else {
          notifyError("Playlist", res?.message || "Thêm bài hát thất bại");
        }
      } else {
        // create then add
        const payload = { title: title.trim(), description: description.trim() };
        if (!payload.title) return notifyWarning("Playlist", "Nhập tên playlist mới");
        const createRes = await createUserPlaylist(payload);
        if (createRes && (createRes.data || createRes.playlist)) {
          const pl = createRes.data?.playlist || createRes.data || createRes.playlist;
          const pid = pl._id || pl.id;
          const addRes = await addTrackToPlaylist(pid, trackId);
          if (addRes && (addRes.statusCode === 200 || addRes.success)) {
            notifySuccess("Playlist", "Đã tạo và thêm vào playlist");
            onAdded?.(pid);
            // Emit event with updated playlist
            try {
              const updated = addRes?.data || addRes?.playlist;
              window.dispatchEvent(new CustomEvent('playlist:track-added', { detail: { playlistId: pid, playlist: updated } }));
            } catch {}
            onClose?.();
          } else {
            // Nếu thêm thất bại, xóa playlist vừa tạo
            try {
              const { deletePlaylist } = await import("../../services/api");
              await deletePlaylist(pid);
              notifyError("Playlist", addRes?.message || "Thêm bài hát thất bại. Playlist mới đã được xóa");
            } catch (e) {
              notifyError("Playlist", addRes?.message || "Thêm bài hát thất bại. Không thể xóa playlist mới");
            }
          }
        } else {
          notifyError("Playlist", createRes?.message || "Tạo playlist thất bại");
        }
      }
    } catch (err) {
      notifyError("Playlist", err.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="playlist-modal-overlay" role="dialog" aria-modal="true">
      <div className="playlist-tracks-modal">
        <div className="playlist-modal__header">
          <h3 style={{ margin: 0 }}>Add to Playlist</h3>
          <button className="playlist-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {loading && <div className="loading">Loading playlists...</div>}
        {error && <div className="error-text">{error}</div>}

        {!loading && !error && (
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="radio" name="mode" checked={mode === 'existing'} onChange={() => setMode('existing')} />
                <span>Playlist hiện có</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="radio" name="mode" checked={mode === 'new'} onChange={() => setMode('new')} />
                <span>Playlist mới</span>
              </label>
            </div>

            {mode === 'existing' ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {playlists.length === 0 ? (
                  <div className="empty-state">Bạn chưa có playlist nào.</div>
                ) : (
                  <select value={selectedId || ''} onChange={(e) => setSelectedId(e.target.value)}>
                    {playlists.map((pl) => (
                      <option key={pl._id || pl.id} value={pl._id || pl.id}>{pl.title}</option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                <input type="text" placeholder="Tên playlist" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input type="text" placeholder="Mô tả (tuỳ chọn)" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn primary" onClick={handleSubmit}>Thêm</button>
              <button className="btn secondary" onClick={onClose}>Hủy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
