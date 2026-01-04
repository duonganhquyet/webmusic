import { useState } from "react";
import "./PlaylistCreateModal.css";

export default function PlaylistCreateModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    imgUrl: "",
    isPublic: true,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Hãy đặt tên bạn nhé!";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Collect data following playlist schema fields
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      imgUrl: form.imgUrl.trim() || undefined,
      isPublic: !!form.isPublic,
      // 'user' and 'tracks' managed server-side; not collected here
    };
    try {
      onSubmit?.(payload);
      onClose?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="playlist-modal-overlay" role="dialog" aria-modal="true">
      <div className="playlist-modal">
        <div className="playlist-modal__header">
          <h3>Create Playlist</h3>
          <button className="playlist-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form className="playlist-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="title">Tên *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Một playlist thư giãn..."
              autoFocus
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-row">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Playlist này phù hợp khi nào?"
              rows={3}
            />
          </div>

          <div className="form-row">
            <label htmlFor="imgUrl">Ảnh (không bắt buộc)</label>
            <input
              id="imgUrl"
              name="imgUrl"
              type="text"
              value={form.imgUrl}
              onChange={handleChange}
              placeholder="Link ảnh bìa hoặc để trống"
            />
          </div>

          <div className="form-row inline">
            <label htmlFor="isPublic">Public</label>
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              checked={form.isPublic}
              onChange={handleChange}
            />
          </div>

          <div className="playlist-modal__actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
