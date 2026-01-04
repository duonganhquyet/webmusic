import React, { useState, useRef } from "react";

function TrackInfoForm({ song, onUpdated }) {
  // 1. Map các state theo đúng tên trường trong ảnh Database
  const [title, setTitle] = useState(song.title || "");
  const [description, setDescription] = useState(song.description || ""); // Trong ảnh là "Dương Domic"
  const [category, setCategory] = useState(song.category || "");       // Trong ảnh là "RAP"
  
  // Các biến trạng thái UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 2. Xử lý ảnh bìa (imgUrl)
  // Lưu ý: Server cần trả về đường dẫn ảnh đầy đủ hoặc bạn phải tự nối chuỗi
  const [imgUrl, setImgUrl] = useState(
    song.imgUrl ? `http://localhost:8080${song.imgUrl}` : null
  );
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef(null);

  // ============================================
  // SUBMIT UPDATE SONG INFO
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      // Gửi request PUT với body đúng key trong Database
      const res = await fetch(
        `http://localhost:8080/api/songs/${song._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title,             // Sửa từ song_title -> title
            description: description, // Sửa từ lyrics/artist_id -> description
            category: category,       // Sửa từ genre_id -> category
            // isDeleted, countLike, countPlay thường không cho sửa ở form này
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      // Gọi callback để báo cha cập nhật UI
      onUpdated && onUpdated(data.song);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // COVER IMAGE UPLOAD (imgUrl)
  // ============================================
  const handleArtworkClick = () => {
    if (coverInputRef.current) coverInputRef.current.click();
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("cover", file); // Tên field này phụ thuộc vào multer bên server

    try {
      setUploadingCover(true);
      setError("");

      // API upload ảnh
      const res = await fetch(
        `http://localhost:8080/api/songs/${song._id}/cover`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cover upload failed");

      // Cập nhật lại imgUrl từ dữ liệu trả về (cần khớp với server trả về key imgUrl)
      setImgUrl(`http://localhost:8080${data.song.imgUrl}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  // ============================================
  // UI
  // ============================================
  return (
    <div className="trackinfo-wrapper">
      <h2 className="trackinfo-title">Chỉnh sửa thông tin</h2>

      <div className="trackinfo-container">

        {/* --- CỘT TRÁI: ẢNH BÌA (imgUrl) --- */}
        <div className="artwork-box" onClick={handleArtworkClick}>
          {imgUrl ? (
            <img src={imgUrl} alt="Cover" className="artwork-img" />
          ) : (
            <div className="artwork-placeholder">Thêm ảnh bìa</div>
          )}

          <input
            type="file"
            accept="image/*"
            hidden
            ref={coverInputRef}
            onChange={handleCoverChange}
          />

          {uploadingCover && (
            <div className="artwork-uploading">Đang tải ảnh...</div>
          )}
        </div>

        {/* --- CỘT PHẢI: FORM NHẬP LIỆU --- */}
        <form className="trackinfo-form" onSubmit={handleSubmit}>

          {/* 1. TITLE */}
          <div className="form-group">
            <label>Tên bài hát (Title) *</label>
            <input
              type="text"
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Mất Kết Nối"
            />
          </div>

          {/* 2. DESCRIPTION (Dùng làm Tên ca sĩ/Mô tả theo ảnh) */}
          <div className="form-group">
            <label>Mô tả / Nghệ sĩ (Description)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Dương Domic"
            />
          </div>

          {/* 3. CATEGORY (Thể loại) */}
          <div className="form-group">
            <label>Thể loại (Category)</label>
            <input 
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ví dụ: RAP"
            />
            {/* Nếu muốn dùng select box cố định thì dùng đoạn dưới này:
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">-- Chọn thể loại --</option>
                <option value="RAP">Rap</option>
                <option value="POP">Pop</option>
                <option value="BALLAD">Ballad</option>
            </select> 
            */}
          </div>

          {error && <p className="error-text" style={{color: 'red'}}>{error}</p>}

          <button type="submit" className="btn save-btn" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TrackInfoForm;