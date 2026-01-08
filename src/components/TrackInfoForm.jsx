import React, { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../contexts/auth.context";

const API_BASE = "http://localhost:8080";

function TrackInfoForm({ song, onUpdated }) {
  const { auth } = useAuthContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // Đây là biến lưu tên Tác giả
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

  // ✅ LOGIC KHỞI TẠO DỮ LIỆU
  useEffect(() => {
    if (song) {
        setTitle(song.title || "");

        // --- XỬ LÝ TÊN TÁC GIẢ MẶC ĐỊNH ---
        let currentDesc = song.description;

        // Nếu DB chưa có gì hoặc đang là "Unknown Artist" -> Lấy tên User
        if (!currentDesc || currentDesc === "Unknown Artist") {
             // Ưu tiên lấy Name, nếu không có thì lấy Username
             currentDesc = auth?.user?.name || auth?.user?.username || "";
        }
        
        setDescription(currentDesc);
        // -----------------------------------

        setCategory(song.category || "");
        setImgUrl(getFullImgUrl(song.imgUrl));
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
    if (!song || !song._id) return setError("Lỗi ID bài hát.");

    try {
      setSaving(true);
      setError("");

      // 1. Cập nhật Text
      const resText = await fetch(`${API_BASE}/api/songs/${song._id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}` // Thêm token cho chắc
          },
          body: JSON.stringify({ title, description, category }),
      });
      const dataText = await resText.json();
      if (!resText.ok) throw new Error(dataText.message || "Lỗi cập nhật");

      let finalSong = dataText.song || dataText.data || dataText;

      // 2. Cập nhật Ảnh
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
          finalSong = dataImg.song || dataImg.data || dataImg;
      }

      setSelectedFile(null);
      onUpdated && onUpdated(finalSong);
      alert("Lưu thành công!");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="trackinfo-wrapper">
      <h2 className="trackinfo-title">Chỉnh sửa thông tin</h2>
      <div className="trackinfo-container">
        
        {/* Phần Ảnh Bìa */}
        <div className="artwork-box" onClick={handleArtworkClick}>
          {imgUrl ? (
            <img src={imgUrl} alt="Cover" className="artwork-img" />
          ) : (
            <div className="artwork-placeholder"><span>📷</span><p>Ảnh bìa</p></div>
          )}
          <input type="file" accept="image/*" hidden ref={coverInputRef} onChange={handleCoverChange} />
          {selectedFile && !saving && <div className="artwork-uploading" style={{background:'#28a745'}}>Chờ lưu...</div>}
          {saving && <div className="artwork-uploading">Đang lưu...</div>}
        </div>

        {/* Phần Form */}
        <form className="trackinfo-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên bài hát *</label>
            <input 
              type="text" required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Nghệ sĩ / Tác giả</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)} // Vẫn cho phép sửa thoải mái
              placeholder="Nhập tên nghệ sĩ..."
            />
          </div>

          <div className="form-group">
            <label>Thể loại</label>
            <input 
              type="text" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
            />
          </div>

          {error && <p style={{color:'red', marginTop:10}}>{error}</p>}
          <button type="submit" className="btn save-btn" disabled={saving}>
            {saving ? "Đang xử lý..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TrackInfoForm;