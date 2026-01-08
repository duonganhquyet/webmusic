import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/UploadPage.css";

// Import component form con
import TrackInfoForm from "../components/TrackInfoForm";
import { uploadSong } from "../services/api";

// ✅ 1. Import hệ thống thông báo mới
import { notifySuccess, notifyError, notifyWarning } from "../utils/notification";

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
  
  // ❌ Đã xóa state message cũ
  // const [message, setMessage] = useState("");

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

  // --- LOGIC UPLOAD FILE ---
  const uploadFiles = async (files) => {
    try {
      if (files.length === 0) return;
      
      // Thông báo đang xử lý (tuỳ chọn, hoặc dùng component loading riêng)
      // notifySuccess("Đang tải lên...", "Vui lòng chờ trong giây lát.");

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await uploadSong(formData);
      
      if (res.statusCode !== 201) throw new Error(res.message || "Upload failed");

      // ✅ Thay setMessage bằng notifySuccess
      notifySuccess("Thành công", "Tải lên bài hát hoàn tất!");

      const uploadedSongs = res.data;
      
      // Kiểm tra ID
      if (uploadedSongs && uploadedSongs.length > 0 && uploadedSongs[0]?._id) {
        setRecentSong(uploadedSongs[0]); 
        setShowTrackInfo(true);
      } else {
        console.warn("Backend trả về dữ liệu thiếu ID:", res.data);
        // ✅ Thay setMessage bằng notifyWarning
        notifyWarning("Cảnh báo", "Upload thành công nhưng không lấy được ID để sửa thông tin.");
      }
    } catch (err) {
      console.error(err);
      // ✅ Thay setMessage bằng notifyError
      notifyError("Lỗi tải lên", err.message || "Có lỗi xảy ra khi tải file.");
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
          // ✅ Thay setMessage
          notifyWarning("Đã dừng", "Đã đạt giới hạn 10 phút ghi âm.");
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
        notifyError("Lỗi thiết bị", "Trình duyệt không hỗ trợ micro.");
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
      // notifySuccess("Đang ghi âm", "Micro đang hoạt động..."); // Có thể bỏ nếu thấy phiền
      startTimer(true);
    } catch (err) {
      console.error(err);
      notifyError("Lỗi truy cập micro", err.message);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      // setMessage("Đã dừng ghi âm."); -> Có thể không cần thông báo ở đây vì UI đã đổi
      stopTimer();
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (!isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      // setMessage("Tạm dừng...");
      stopTimer();
    } else {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      // setMessage("Đang ghi âm...");
      startTimer(false);
    }
  };

  const handleUploadRecording = async () => {
    if (!recordedBlob) {
      notifyWarning("Chưa có file", "Vui lòng ghi âm trước khi tải lên.");
      return;
    }
    const file = new File([recordedBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
    setSelectedFiles([file]);
    await uploadFiles([file]);
  };

  const handleDeleteRecording = () => {
    clearPreviousRecording();
    setSelectedFiles([]);
    notifySuccess("Đã hủy", "Bản ghi âm đã được xóa.");
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
          {/* Đã xóa hiển thị message text ở đây */}
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
              // ✅ Thay message text bằng notifySuccess
              notifySuccess("Hoàn tất", "Thông tin bài hát đã được cập nhật!");
            }}
          />
        )}
      </main>
    </div>
  );
}