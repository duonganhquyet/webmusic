import React, { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../contexts/auth.context"; 
import "../assets/UploadPage.css"; 
import { resolveAssetUrl } from "../utils/url";

// ✅ 1. Import hệ thống thông báo
import { notifySuccess, notifyError } from "../utils/notification";

const API_BASE = "http://localhost:8080";

const GENRES = [
  "Pop", "Ballad", "Rap/Hip-hop", "R&B", "EDM", 
  "Indie", "Rock", "Bolero", "Lofi", "Remix", "Khác"
];

function TrackInfoForm({ song, onUpdated }) {
  const { auth } = useAuthContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); 
  const [category, setCategory] = useState("");
  
  const [imgUrl, setImgUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const coverInputRef = useRef(null);

  const getFullImgUrl = (path) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  useEffect(() => {
    if (song) {
        setTitle(song.title || "");

        let currentDesc = song.description;
        if (!currentDesc || currentDesc === "Unknown Artist") {
             currentDesc = auth?.user?.name || auth?.user?.username || "";
        }
        
        setDescription(currentDesc);
        setCategory(song.category || "");
        
        setImgUrl(resolveAssetUrl(song.imgUrl));
        setSelectedFile(null); 
        setError("");
    }
  }, [song, auth]);

  const handleArtworkClick = () => {
    if (coverInputRef.current) coverInputRef.current.click();
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setImgUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!song || !song._id) {
        const msg = "Lỗi ID bài hát.";
        setError(msg);
        notifyError("Lỗi", msg);
        return;
    }

    try {
      setSaving(true);
      setError("");

      // --- 1. CẬP NHẬT THÔNG TIN VĂN BẢN (TEXT) ---
      const resText = await fetch(`${API_BASE}/api/songs/${song._id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}` 
          },
          body: JSON.stringify({ title, description, category }),
      });
      
      const textResponse = await resText.text();
      let dataText;
      try {
          dataText = JSON.parse(textResponse);
      } catch (e) {
          throw new Error("Server trả về lỗi (có thể sai đường dẫn): " + textResponse.substring(0, 100));
      }

      if (!resText.ok) throw new Error(dataText.message || "Lỗi cập nhật thông tin");

      let finalSongData = dataText.song || dataText.data || dataText;

      // --- 2. UPLOAD ẢNH BÌA (NẾU CÓ CHỌN ẢNH MỚI) ---
      if (selectedFile) {
          const formData = new FormData();
          formData.append("cover", selectedFile); 

          const resImg = await fetch(`${API_BASE}/api/songs/${song._id}/cover`, {
              method: "POST",
              headers: { 
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}` 
              },
              body: formData
          });
          
          const dataImg = await resImg.json();
          if (!resImg.ok) throw new Error(dataImg.message || "Lỗi upload ảnh");

          finalSongData = dataImg.song || dataImg.data || dataImg;
      }

      // Hoàn tất
      setSelectedFile(null);
      onUpdated && onUpdated(finalSongData);
      
      // ✅ Thay alert bằng notifySuccess
      notifySuccess("Thành công", "Đã lưu thay đổi thông tin bài hát!");

    } catch (err) {
      console.error(err);
      setError(err.message);
      // ✅ Thêm notifyError để báo lỗi rõ ràng
      notifyError("Lỗi cập nhật", err.message || "Có lỗi xảy ra khi lưu thông tin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="trackinfo-wrapper">
      <h3 className="trackinfo-title">Chỉnh sửa thông tin</h3>
      <div className="trackinfo-container">
        
        {/* Phần Ảnh Bìa */}
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
             <div className="artwork-uploading" style={{background: '#28a745'}}>Đã chọn ảnh</div>
          )}
          {saving && <div className="artwork-uploading">Đang lưu...</div>}
        </div>

        {/* Phần Form Nhập liệu */}
        <form className="trackinfo-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Tên bài hát (Title) *</label>
            <input 
              type="text" required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Nhập tên bài hát..."
            />
          </div>

          <div className="form-group">
            <label>Nghệ sĩ / Tác giả</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập tên nghệ sĩ..."
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

          {error && <p className="error-text" style={{color:'red', marginTop:10}}>{error}</p>}
          
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TrackInfoForm;