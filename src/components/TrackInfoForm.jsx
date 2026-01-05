import React, { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:8080";

function TrackInfoForm({ song, onUpdated }) {
  // --- STATE DỮ LIỆU ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  
  // State hiển thị ảnh (Link server hoặc Link xem trước tạm thời)
  const [imgUrl, setImgUrl] = useState(null);
  
  // State lưu file gốc để chờ upload khi bấm Lưu
  const [selectedFile, setSelectedFile] = useState(null);

  // State trạng thái
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const coverInputRef = useRef(null);

  // Hàm xử lý link ảnh từ server
  const getFullImgUrl = (path) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // ✅ KHI SONG THAY ĐỔI -> RESET FORM
  useEffect(() => {
    if (song) {
        setTitle(song.title || "");
        setDescription(song.description || "");
        setCategory(song.category || "");
        
        // Reset ảnh về ảnh cũ của server (vì bài hát đổi thì ảnh preview cũ không còn giá trị)
        setImgUrl(getFullImgUrl(song.imgUrl));
        setSelectedFile(null); 
        
        setError("");
    }
  }, [song]);

  // ============================================
  // 1. XỬ LÝ CHỌN ẢNH (CHỈ XEM TRƯỚC - KHÔNG UPLOAD NGAY)
  // ============================================
  const handleArtworkClick = () => {
    if (coverInputRef.current) coverInputRef.current.click();
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Lưu file vào biến tạm (để tí nữa bấm Lưu thì gửi đi)
    setSelectedFile(file);

    // 2. Tạo đường dẫn ảo để HIỆN ẢNH NGAY LẬP TỨC
    const previewUrl = URL.createObjectURL(file);
    setImgUrl(previewUrl);
  };

  // ============================================
  // 2. BẤM NÚT LƯU (GỬI CẢ CHỮ VÀ ẢNH)
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!song || !song._id) {
        setError("Lỗi: Không tìm thấy ID bài hát.");
        return;
    }

    try {
      setSaving(true);
      setError("");

      // --- BƯỚC 1: CẬP NHẬT THÔNG TIN VĂN BẢN (TEXT) ---
      const resText = await fetch(`${API_BASE}/api/songs/${song._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, category }),
      });
      
      const dataText = await resText.json();
      if (!resText.ok) throw new Error(dataText.message || "Lỗi cập nhật thông tin");

      // Biến lưu kết quả cuối cùng
      let finalSongData = dataText.song || dataText.data || dataText;

      // --- BƯỚC 2: UPLOAD ẢNH (NẾU CÓ CHỌN FILE MỚI) ---
      if (selectedFile) {
          const formData = new FormData();
          formData.append("cover", selectedFile);

          const resImg = await fetch(`${API_BASE}/api/songs/${song._id}/cover`, {
              method: "POST",
              body: formData
          });

          const dataImg = await resImg.json();
          if (!resImg.ok) throw new Error(dataImg.message || "Lỗi upload ảnh");

          // Cập nhật lại dữ liệu bài hát mới nhất từ server (có link ảnh mới)
          finalSongData = dataImg.song || dataImg.data || dataImg;
      }

      // --- HOÀN TẤT ---
      // Xóa file tạm đi vì đã lưu xong
      setSelectedFile(null);
      
      // Báo trang cha cập nhật
      onUpdated && onUpdated(finalSongData);
      
      alert("Đã lưu thay đổi thành công!");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // GIAO DIỆN UI
  // ============================================
  return (
    <div className="trackinfo-wrapper">
      <h2 className="trackinfo-title">Chỉnh sửa thông tin</h2>

      <div className="trackinfo-container">

        {/* Cột Trái: Ảnh Bìa */}
        <div className="artwork-box" onClick={handleArtworkClick}>
          {imgUrl ? (
            <img src={imgUrl} alt="Cover" className="artwork-img" />
          ) : (
            <div className="artwork-placeholder">
                 <span style={{fontSize: '24px'}}>📷</span>
                 <p>Thêm ảnh bìa</p>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            hidden
            ref={coverInputRef}
            onChange={handleCoverChange}
          />

          {/* Hiển thị dòng chữ nếu đang có ảnh chờ lưu */}
          {selectedFile && !saving && (
            <div className="artwork-uploading" style={{background: 'rgba(40, 167, 69, 0.8)'}}>
                Ảnh đang chờ lưu...
            </div>
          )}
          
          {saving && (
             <div className="artwork-uploading">Đang xử lý...</div>
          )}
        </div>

        {/* Cột Phải: Form Nhập Liệu */}
        <form className="trackinfo-form" onSubmit={handleSubmit}>

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

          <div className="form-group">
            <label>Mô tả / Nghệ sĩ (Description)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Dương Domic"
            />
          </div>

          <div className="form-group">
            <label>Thể loại (Category)</label>
            <input 
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ví dụ: RAP"
            />
          </div>

          {error && <p className="error-text" style={{color: 'red', marginTop: '10px'}}>{error}</p>}

          <button type="submit" className="btn save-btn" disabled={saving}>
            {saving ? "Đang lưu tất cả..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TrackInfoForm;