import { useRef, useState } from "react";
import "./PlaylistCreateModal.css";

export default function PlaylistCreateModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    imgUrl: "",
    isPublic: true,
  });
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

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
      isPublic: !!form.isPublic,
      // 'user' and 'tracks' managed server-side; not collected here
    };
    try {
      // Pass both json payload and optional file
      onSubmit?.(payload, selectedFile || null);
      onClose?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePickFile = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
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
            <label>Ảnh bìa (tùy chọn)</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 96, height: 96, background: '#111', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#777', fontSize: 12 }}>No cover</span>
                )}
              </div>
              <div style={{ display: 'grid', gap: 8, flex: 1 }}>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                  <button type="button" className="btn secondary" onClick={handlePickFile}>Chọn ảnh từ máy</button>
                  {selectedFile && <span style={{ marginLeft: 8, fontSize: 12 }}>{selectedFile.name}</span>}
                </div>
              </div>
            </div>
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
