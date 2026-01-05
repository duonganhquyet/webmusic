import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/UploadPage.css";

// 👇 QUAN TRỌNG: Import component form vừa tạo ở trên
// Nếu bạn lưu file kia trong thư mục components thì để dòng này:
import TrackInfoForm from "../components/TrackInfoForm";
// Nếu bạn lưu cùng thư mục pages thì đổi thành: import TrackInfoForm from "./TrackInfoForm";

const API_BASE = "http://localhost:8080";
const MAX_RECORD_SECONDS = 600; 

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

  // TRACK INFO
  const [recentSong, setRecentSong] = useState(null);
  const [showTrackInfo, setShowTrackInfo] = useState(false);

  const navigate = useNavigate();

  // --- LOGIC UPLOAD FILE (Đã sửa lỗi lấy ID) ---
  const uploadFiles = async (files) => {
    try {
      if (files.length === 0) return;
      
      setMessage("Đang tải lên server...");
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setMessage("Tải lên thành công! File đã lưu vào thư mục filemp3.");

      // SỬA LỖI: Tìm đúng vị trí dữ liệu bài hát
      const responseData = data.data || data.songs || data; 
      const uploadedSongs = Array.isArray(responseData) ? responseData : [responseData];
      
      // Kiểm tra ID
      if (uploadedSongs.length > 0 && uploadedSongs[0]?._id) {
        setRecentSong(uploadedSongs[0]); 
        setShowTrackInfo(true);
      } else {
        console.warn("Backend trả về dữ liệu thiếu ID:", data);
        setMessage("Upload thành công nhưng không lấy được ID bài hát để sửa thông tin.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi khi tải lên: " + err.message);
    }
  };

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
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

        {/* Render Component Form con */}
        {showTrackInfo && recentSong && (
          <TrackInfoForm
            song={recentSong}
            onUpdated={(newSong) => {
              setRecentSong(newSong);
              setShowTrackInfo(false);
              setMessage("Cập nhật thông tin thành công!");
            }}
          />
        )}
      </main>
    </div>
  );
}