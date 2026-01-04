import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notifyWarning, notifyError, notifySuccess } from '../utils/notification';
import "../assets/UploadPage.css";

// Cổng Backend (8080)
const API_BASE = "http://localhost:8080";
const MAX_RECORD_SECONDS = 600; // 10 phút

// Hàm format thời gian (MM:SS)
function formatTime(seconds) {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

// Hàm chuẩn hóa đường dẫn ảnh/nhạc từ Backend
const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path; // Nếu là link online (zing mp3, nhaccuatui...)
  
  // Đảm bảo đường dẫn bắt đầu bằng dấu "/" để ghép với API_BASE
  // Ví dụ: path là "images/abc.jpg" -> "/images/abc.jpg"
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

export default function UploadPage() {
  const [isDragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState("");

  // STATE GHI ÂM
  const [isRecordPanelOpen, setRecordPanelOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordTime, setRecordTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // TRACK INFO (Sau khi upload xong)
  const [recentSong, setRecentSong] = useState(null);
  const [showTrackInfo, setShowTrackInfo] = useState(false);

  const navigate = useNavigate();

  // ========== 1. UPLOAD AUDIO (Lưu vào folder filemp3) ==========
  const uploadFiles = async (files) => {
    try {
      if (files.length === 0) return;
      
      setMessage("Đang tải lên server...");
      const formData = new FormData();
      // Backend đang dùng upload.single('files') hoặc array('files')
      // Đảm bảo key này khớp với backend (thường là "file" hoặc "files")
      files.forEach((file) => formData.append("files", file));

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setMessage("Tải lên thành công! File đã lưu vào thư mục filemp3.");

      // Backend trả về mảng songs hoặc 1 song
      const uploadedSongs = data.songs || (Array.isArray(data) ? data : [data]);
      
      if (uploadedSongs.length > 0) {
        setRecentSong(uploadedSongs[0]); // Lấy bài vừa up để sửa info
        setShowTrackInfo(true);
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi khi tải lên: " + err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
    uploadFiles(files);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    uploadFiles(files);
  };

  // ========== 2. LOGIC GHI ÂM (Record) ==========
  const toggleRecordPanel = () => setRecordPanelOpen((prev) => !prev);

  const clearPreviousRecording = () => {
    if (recordedAudioURL) URL.revokeObjectURL(recordedAudioURL);
    setRecordedAudioURL(null);
    setRecordedBlob(null);
    setRecordTime(0);
  };

  const startTimer = (reset = true) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (reset) setRecordTime(0);

    timerRef.current = setInterval(() => {
      setRecordTime((prev) => {
        const next = prev + 0.2; // Cập nhật mỗi 200ms
        if (next >= MAX_RECORD_SECONDS) {
          if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
          setIsRecording(false);
          setIsPaused(false);
          setMessage("Đã đạt giới hạn 10 phút, tự động dừng.");
          stopTimer();
          return MAX_RECORD_SECONDS;
        }
        return next;
      });
    }, 200);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Trình duyệt không hỗ trợ micro.");
        return;
      }

      clearPreviousRecording();
      setSelectedFiles([]);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioURL(url);

        stream.getTracks().forEach((t) => t.stop());
        stopTimer();
        setIsPaused(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setMessage("Đang ghi âm...");
      startTimer(true);
    } catch (err) {
      console.error(err);
      alert("Không thể truy cập micro: " + err.message);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setMessage("Đã dừng ghi âm.");
      stopTimer();
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (!isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setMessage("Tạm dừng...");
      stopTimer();
    } else {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setMessage("Đang ghi âm...");
      startTimer(false);
    }
  };

  const handleUploadRecording = async () => {
    if (!recordedBlob) {
      alert("Chưa có file ghi âm.");
      return;
    }
    // Tạo file từ Blob, đặt tên đuôi .webm
    const file = new File([recordedBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
    setSelectedFiles([file]);
    await uploadFiles([file]);
  };

  const handleDeleteRecording = () => {
    clearPreviousRecording();
    setSelectedFiles([]);
    setMessage("Đã hủy bản ghi.");
  };

  const handleClose = () => navigate("/");

  const progressPercent = Math.min((recordTime / MAX_RECORD_SECONDS) * 100, 100);

  return (
    <div className="upload-page">
      <header className="upload-header">
        <div className="upload-logo">Upload Music</div>
        <button className="close-btn" onClick={handleClose}>×</button>
      </header>

      <main className="upload-main">
        {/* Kéo thả file */}
        <div
          className={`dropzone ${isDragging ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="dropzone-inner">
            <div className="cloud-icon">☁️</div>
            <p className="drop-text">Kéo thả file nhạc (MP3, WAV...) vào đây</p>
            <label className="choose-files-btn">
              Chọn File
              <input type="file" multiple hidden accept="audio/*" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        {/* Thanh Record */}
        <div className="bottom-bar" onClick={toggleRecordPanel}>
          <div className="mic-section">
            <span className="mic-icon">🎙️</span>
            <span className="mic-text">Hoặc ghi âm trực tiếp</span>
          </div>
          <div className="arrow-icon">{isRecordPanelOpen ? "▲" : "▼"}</div>
        </div>

        {/* Panel Điều khiển Record */}
        {isRecordPanelOpen && (
          <div className="record-panel">
            <div className="record-controls">
              {!isRecording ? (
                <button className="btn start-btn" onClick={handleStartRecording}>Bắt đầu</button>
              ) : (
                <>
                  <button className="btn stop-btn" onClick={handleStopRecording}>Dừng</button>
                  <button className="btn pause-btn" onClick={handlePauseResume}>{isPaused ? "Tiếp tục" : "Tạm dừng"}</button>
                </>
              )}

              {recordedAudioURL && !isRecording && (
                <>
                  <button className="btn upload-btn" onClick={handleUploadRecording}>Tải lên</button>
                  <button className="btn delete-btn" onClick={handleDeleteRecording}>Xóa</button>
                </>
              )}
            </div>

            {isRecording && (
              <div className="record-timer">
                <div className="record-time-text">{formatTime(recordTime)}</div>
                <div className="record-time-bar">
                  <div className="record-time-bar-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}

            {recordedAudioURL && (
              <div className="record-preview">
                <audio controls src={recordedAudioURL} />
              </div>
            )}
          </div>
        )}

        {/* Hiển thị trạng thái */}
        <div className="status-area">
          {message && <p className="message-text">{message}</p>}
          {selectedFiles.length > 0 && (
            <div className="file-list">
              {selectedFiles.map((f, i) => <div key={i}>📄 {f.name}</div>)}
            </div>
          )}
        </div>

        {/* Form sửa thông tin bài hát (Hiển thị sau khi upload xong) */}
        {showTrackInfo && recentSong && (
          <TrackInfoForm
            song={recentSong}
            onUpdated={(newSong) => {
              setRecentSong(newSong);
              setShowTrackInfo(false);
              setMessage("Cập nhật thông tin thành công!");
              // Có thể navigate về trang nghe nhạc nếu muốn
              // navigate(`/track/${newSong._id}`);
            }}
          />
        )}
      </main>
    </div>
  );
}

// ========= COMPONENT SỬA THÔNG TIN & UPLOAD ẢNH (Lưu vào folder images) =========
function TrackInfoForm({ song, onUpdated }) {
  // State form
  const [title, setTitle] = useState(song.title || "");
  const [description, setDescription] = useState(song.description || ""); // Artist
  const [category, setCategory] = useState(song.category || ""); // Genre
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Xử lý hiển thị ảnh cover
  const [imgUrl, setImgUrl] = useState(getFullUrl(song.imgUrl));
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef(null);

  // Cập nhật thông tin văn bản
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/songs/${song._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi cập nhật");

      onUpdated && onUpdated(data.song);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Upload ảnh Cover (Vào folder images)
  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("cover", file); // Key 'cover' phải khớp với backend multer

    try {
      setUploadingCover(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/songs/${song._id}/cover`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi upload ảnh");

      // Cập nhật UI ngay lập tức với đường dẫn mới từ Backend (trong folder images)
      setImgUrl(getFullUrl(data.song.imgUrl));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingCover(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="trackinfo-wrapper">
      <h2 className="trackinfo-title">Chỉnh sửa thông tin bài hát</h2>
      <div className="trackinfo-container">
        
        {/* Phần Ảnh Bìa (Cover) */}
        <div className="artwork-box" onClick={() => coverInputRef.current.click()}>
          {imgUrl ? (
            <img src={imgUrl} alt="Cover" className="artwork-img" />
          ) : (
            <div className="artwork-placeholder">
               <span>📷</span>
               <p>Tải ảnh bìa</p>
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            hidden
            ref={coverInputRef}
            onChange={handleCoverChange}
          />
          
          {uploadingCover && <div className="artwork-overlay">Đang tải...</div>}
        </div>

        {/* Form Nhập Liệu */}
        <form className="trackinfo-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên bài hát *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ví dụ: Lạc Trôi"
            />
          </div>

          <div className="form-group">
            <label>Ca sĩ / Nghệ sĩ (Description)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Sơn Tùng M-TP"
            />
          </div>

          <div className="form-group">
            <label>Thể loại (Category)</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ví dụ: POP, BALLAD..."
            />
          </div>

          {error && <p className="error-text">⚠️ {error}</p>}

          <button type="submit" className="btn save-btn" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu & Hoàn tất"}
          </button>
        </form>
      </div>
    </div>
  );
}