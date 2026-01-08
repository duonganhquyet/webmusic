import React, { useState, useRef, useEffect } from "react";
// Import file CSS (đảm bảo bạn đã tạo file này như hướng dẫn trước)
import "../assets/UploadPage.css"; 
import { resolveAssetUrl } from "../utils/url";

const API_BASE = "http://localhost:8080";

// Danh sách thể loại nhạc
const GENRES = [
  "Pop", "Ballad", "Rap/Hip-hop", "R&B", "EDM", 
  "Indie", "Rock", "Bolero", "Lofi", "Remix", "Khác"
];

function TrackInfoForm({ song, onUpdated }) {
  // --- STATE DỮ LIỆU ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(""); 
  
  // State hiển thị ảnh
  const [imgUrl, setImgUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // State trạng thái
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const coverInputRef = useRef(null);

  // Helper: Use shared resolver for previewing stored cover

  // ✅ KHI SONG THAY ĐỔI -> RESET FORM
  useEffect(() => {
    if (song) {
        setTitle(song.title || "");
        setDescription(song.description || "");
        setCategory(song.category || ""); 
        
        setImgUrl(resolveAssetUrl(song.imgUrl));
        setSelectedFile(null); 
        setError("");
    }
  }, [song]);

  // Xử lý chọn ảnh (Preview)
  const handleArtworkClick = () => {
    if (coverInputRef.current) coverInputRef.current.click();
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setImgUrl(URL.createObjectURL(file));
  };

  // ============================================
  // 🔥 PHẦN QUAN TRỌNG: HÀM GỬI DỮ LIỆU (ĐÃ SỬA)
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

      // --- 1. CẬP NHẬT THÔNG TIN (TEXT) ---
      // Router: songRouter.put("/songs/:id", ...)
      // -> URL Frontend: /api/songs/${id}
      const resText = await fetch(`${API_BASE}/api/songs/${song._id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${token}` // Bỏ comment nếu cần token
          },
          body: JSON.stringify({ title, description, category }),
      });
      
      // Xử lý lỗi nếu server trả về HTML thay vì JSON
      const textResponse = await resText.text();
      let dataText;
      try {
          dataText = JSON.parse(textResponse);
      } catch (e) {
          throw new Error("Server trả về lỗi (có thể sai đường dẫn): " + textResponse.substring(0, 100));
      }

      if (!resText.ok) throw new Error(dataText.message || "Lỗi cập nhật thông tin");

      // Dữ liệu bài hát sau khi update text
      let finalSongData = dataText.song || dataText.data || dataText;

      // --- 2. UPLOAD ẢNH BÌA (NẾU CÓ) ---
      if (selectedFile) {
          const formData = new FormData();
          // 👇 QUAN TRỌNG: Router dùng .single("cover") nên key phải là "cover"
          formData.append("cover", selectedFile); 

          // Router: songRouter.post("/songs/:id/cover", ...)
          // -> URL Frontend: /api/songs/${id}/cover
          // -> Method: POST (Router dùng POST, không phải PUT)
          const resImg = await fetch(`${API_BASE}/api/songs/${song._id}/cover`, {
              method: "POST", 
              // headers Authorization nếu cần (không set Content-Type để browser tự set multipart)
              body: formData
          });

          const dataImg = await resImg.json();
          if (!resImg.ok) throw new Error(dataImg.message || "Lỗi upload ảnh");

          // Cập nhật lại dữ liệu mới nhất có ảnh
          finalSongData = dataImg.song || dataImg.data || dataImg;
      }

      // Hoàn tất
      setSelectedFile(null);
      onUpdated && onUpdated(finalSongData);
      alert("Đã lưu thay đổi thành công!");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="trackinfo-wrapper">
      <h3 className="trackinfo-title">Chỉnh sửa thông tin</h3>

      <div className="trackinfo-container">
        {/* Box Ảnh */}
        <div className="artwork-box" onClick={handleArtworkClick}>
          {imgUrl ? (
            <img src={imgUrl} alt="Cover" className="artwork-img" />
          ) : (
            <div className="artwork-placeholder">
              <span style={{ fontSize: "30px", display: "block", marginBottom: "5px" }}>📷</span>
              <span>Thêm ảnh bìa</span>
            </div>
          )}
          
          <input type="file" accept="image/*" hidden ref={coverInputRef} onChange={handleCoverChange} />
          
          {selectedFile && !saving && (
             <div className="artwork-uploading" style={{background: 'rgba(249, 115, 22, 0.9)'}}>Đã chọn ảnh</div>
          )}
        </div>

        {/* Form Nhập liệu */}
        <form className="trackinfo-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Tên bài hát (Title) *</label>
            <input
              type="text"
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên bài hát..."
            />
          </div>

          <div className="form-group">
            <label>Mô tả / Nghệ sĩ</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả hoặc tên nghệ sĩ..."
            />
          </div>

          <div className="form-group">
            <label>Thể loại (Category)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>-- Chọn thể loại --</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TrackInfoForm;