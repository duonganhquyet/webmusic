import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/UploadPage.css";

const API_BASE = "http://localhost:8080";
const MAX_RECORD_SECONDS = 600; // 10 phút

function formatTime(seconds) {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export default function UploadPage() {
  const [isDragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState("");

  // GHI ÂM
  const [isRecordPanelOpen, setRecordPanelOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordTime, setRecordTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // TRACK INFO
  const [recentSong, setRecentSong] = useState(null);
  const [showTrackInfo, setShowTrackInfo] = useState(false);

  const navigate = useNavigate();

  // ========== UPLOAD AUDIO ==========
  const uploadFiles = async (files) => {
    try {
      setMessage("Đang tải lên...");
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setMessage("Tải lên thành công!");

      if (data.songs && data.songs.length > 0) {
        setRecentSong(data.songs[0]);
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

  // ========== GHI ÂM (Giữ nguyên logic cũ) ==========
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
        const next = prev + 0.2;
        if (next >= MAX_RECORD_SECONDS) {
          if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
          setIsRecording(false);
          setIsPaused(false);
          setMessage("Đã đạt giới hạn 10 phút, ghi âm đã dừng.");
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
        alert("Trình duyệt của bạn không hỗ trợ ghi âm.");
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
      setMessage("Đã dừng ghi âm. Bạn có thể nghe thử và upload.");
      stopTimer();
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (!isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setMessage("Đang tạm dừng ghi âm...");
      stopTimer();
    } else {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setMessage("Tiếp tục ghi âm...");
      startTimer(false);
    }
  };

  const handleUploadRecording = async () => {
    if (!recordedBlob) {
      alert("Chưa có bản ghi để upload.");
      return;
    }

    const file = new File(
      [recordedBlob],
      `recording-${Date.now()}.webm`,
      { type: "audio/webm" }
    );

    setSelectedFiles([file]);
    await uploadFiles([file]);
  };

  const handleDeleteRecording = () => {
    clearPreviousRecording();
    setSelectedFiles([]);
    setMessage("Đã xoá bản ghi.");
  };

  const handleClose = () => navigate("/");

  const progressPercent = Math.min(
    (recordTime / MAX_RECORD_SECONDS) * 100,
    100
  );

  return (
    <div className="upload-page">
      <header className="upload-header">
        <div className="upload-logo">Upload</div>
        <button className="close-btn" onClick={handleClose}>
          ×
        </button>
      </header>

      <main className="upload-main">
        {/* DROPZONE */}
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
            <div className="cloud-icon">☁️⬆️</div>
            <p className="drop-text">
              Drag and drop audio files to get started.
            </p>
            <label className="choose-files-btn">
              Choose files
              <input
                type="file"
                multiple
                hidden
                accept="audio/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* RECORD BAR */}
        <div className="bottom-bar" onClick={toggleRecordPanel}>
          <div className="mic-section">
            <span className="mic-icon">🎙️</span>
            <span className="mic-text">Or record with a microphone</span>
          </div>
          <div className="mic-description">
            Upload recorded voice memos, updates, news, or intros to new releases.
          </div>
          <div className="arrow-icon">{isRecordPanelOpen ? "▲" : "▼"}</div>
        </div>

        {/* PANEL GHI ÂM */}
        {isRecordPanelOpen && (
          <div className="record-panel">
            <div className="record-controls">
              {!isRecording ? (
                <button className="btn start-btn" onClick={handleStartRecording}>
                  Bắt đầu ghi âm
                </button>
              ) : (
                <>
                  <button className="btn stop-btn" onClick={handleStopRecording}>
                    Dừng ghi âm
                  </button>
                  <button className="btn pause-btn" onClick={handlePauseResume}>
                    {isPaused ? "Tiếp tục" : "Tạm dừng"}
                  </button>
                </>
              )}

              {recordedAudioURL && !isRecording && (
                <>
                  <button
                    className="btn upload-btn"
                    onClick={handleUploadRecording}
                  >
                    Upload bản ghi
                  </button>
                  <button
                    className="btn delete-btn"
                    onClick={handleDeleteRecording}
                  >
                    Xoá bản ghi
                  </button>
                </>
              )}
            </div>

            {isRecording && (
              <div className="record-timer">
                <div className="record-time-text">
                  Thời gian: {formatTime(recordTime)}
                </div>
                <div className="record-time-bar">
                  <div
                    className="record-time-bar-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {recordedAudioURL && (
              <div className="record-preview">
                <p>Nghe thử bản ghi:</p>
                <audio controls src={recordedAudioURL}></audio>
              </div>
            )}
          </div>
        )}

        {/* STATUS */}
        <div className="status-area">
          {message && <p>{message}</p>}
          {selectedFiles.length > 0 && (
            <ul className="file-list">
              {selectedFiles.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* TRACK INFO FORM - ĐÃ SỬA LẠI */}
        {showTrackInfo && recentSong && (
          <TrackInfoForm
            song={recentSong}
            onUpdated={(newSong) => {
              setRecentSong(newSong);
              setShowTrackInfo(false);
              setMessage("Đã cập nhật thông tin bài hát.");
            }}
          />
        )}
      </main>
    </div>
  );
}

// ========= FORM TRACK INFO (ĐÃ CHỈNH SỬA THEO DB MỚI) =========
function TrackInfoForm({ song, onUpdated }) {
  // 1. Map state đúng với database (title, description, category, imgUrl)
  const [title, setTitle] = useState(song.title || "");
  const [description, setDescription] = useState(song.description || ""); // Artist Name
  const [category, setCategory] = useState(song.category || ""); // Genre
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 2. Cover Image (imgUrl)
  const [imgUrl, setImgUrl] = useState(
    song.imgUrl ? `${API_BASE}${song.imgUrl.startsWith("/") ? "" : "/"}${song.imgUrl}` : null
  );
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      // Gửi PUT với các trường chuẩn
      const res = await fetch(`${API_BASE}/api/songs/${song._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          description: description, // Dùng làm Artist
          category: category,       // Dùng làm Genre
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      onUpdated && onUpdated(data.song);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // COVER UPLOAD
  const handleArtworkClick = () => {
    if (coverInputRef.current) coverInputRef.current.click();
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("cover", file);

    try {
      setUploadingCover(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/songs/${song._id}/cover`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cover upload failed");

      // Cập nhật lại imgUrl từ server trả về
      const newImgPath = data.song.imgUrl;
      const fullUrl = `${API_BASE}${newImgPath.startsWith("/") ? "" : "/"}${newImgPath}`;
      setImgUrl(fullUrl);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  return (
    <div className="trackinfo-wrapper">
      <h2 className="trackinfo-title">Track info</h2>
      <div className="trackinfo-container">
        {/* Artwork (imgUrl) */}
        <div className="artwork-box" onClick={handleArtworkClick}>
          {imgUrl ? (
            <img src={imgUrl} alt="Cover" className="artwork-img" />
          ) : (
            <div className="artwork-placeholder">Add new artwork</div>
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

        {/* Form Nhập Liệu Đơn Giản */}
        <form className="trackinfo-form" onSubmit={handleSubmit}>
          
          {/* TITLE */}
          <div className="form-group">
            <label>Track title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Nhập tên bài hát"
            />
          </div>

          {/* DESCRIPTION (ARTIST) */}
          <div className="form-group">
            <label>Nghệ sĩ (Description)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập tên nghệ sĩ (Dương Domic)"
            />
          </div>

          {/* CATEGORY (GENRE) */}
          <div className="form-group">
            <label>Thể loại (Category)</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Nhập thể loại (RAP, POP...)"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn save-btn" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </form>
      </div>
    </div>
  );
}