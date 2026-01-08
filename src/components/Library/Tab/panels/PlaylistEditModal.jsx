import { useEffect, useState } from "react";
import "./PlaylistEditModal.css";
import { updatePlaylistInfo } from "../../../../services/api";
import { notifyError, notifySuccess } from "../../../../utils/notification";

export default function PlaylistEditModal({ playlist, onClose, onUpdated }) {
  const [form, setForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (playlist) {
      setForm({ title: playlist.title || "", description: playlist.description || "" });
    }
  }, [playlist]);

  const handleSave = async () => {
    if (!playlist?._id && !playlist?.id) return;
    setSaving(true);
    try {
      const res = await updatePlaylistInfo(playlist._id || playlist.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        isPublic: !!playlist.isPublic,
      });
      if (res && res.data) {
        notifySuccess("Playlist", "Đã cập nhật playlist");
        onUpdated?.(res.data);
        onClose?.();
      } else {
        notifyError("Playlist", res?.message || "Cập nhật thất bại");
      }
    } catch (err) {
      notifyError("Playlist", err.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="playlist-edit-overlay" role="dialog" aria-modal="true">
      <div className="playlist-edit-modal">
        <div className="playlist-edit__header">
          <h3 style={{ margin: 0 }}>Sửa playlist</h3>
          <button className="playlist-edit__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="playlist-edit__body">
          <label>
            <span className="label">Tên</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label>
            <span className="label">Mô tả</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
        </div>
        <div className="playlist-edit__footer">
          <button className="btn secondary" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="btn primary" onClick={handleSave} disabled={saving}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
