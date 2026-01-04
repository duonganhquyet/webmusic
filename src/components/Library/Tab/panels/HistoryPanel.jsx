import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SongItem from "../../SongItem/SongItem";

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hàm format thời gian
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        day: '2-digit', 
        month: '2-digit' 
    });
  };

  useEffect(() => {
    // 1. Kiểm tra Token
    const token = localStorage.getItem('token'); 
    
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    // 2. Gọi API
    const fetchHistory = async () => {
      try {
        // Backend cần populate field 'track' để lấy chi tiết bài hát
        const response = await axios.get('http://localhost:5000/api/history', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && Array.isArray(response.data)) {
          setHistory(response.data);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (confirm("Bạn có chắc muốn xóa toàn bộ lịch sử?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:5000/api/history', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setHistory([]);
        alert("Đã xóa lịch sử!");
      } catch (error) {
        alert("Lỗi khi xóa lịch sử.");
      }
    }
  };

  // --- RENDER ---

  if (!isLoggedIn) {
    return (
      <div className="history-panel">
        <div className="panel-header"><h3>History</h3></div>
        <div className="empty-state" style={{ textAlign: 'center', padding: '30px 0' }}>
          <p>Vui lòng đăng nhập để xem lịch sử.</p>
          <Link to="/login" style={{ fontWeight: 'bold', color: '#fff', textDecoration: 'underline' }}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="panel-header">
        <div>
          <h3>History</h3>
          <p>Đã nghe gần đây ({history.length} bài)</p>
        </div>
        {history.length > 0 && (
          <button className="clear-history-btn" onClick={handleClearHistory}>
            Clear All
          </button>
        )}
      </div>

      <div className="song-list">
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Đang tải...</p>
        ) : (
          history.map((item) => {
             // Lấy object bài hát từ trường 'track' (theo screenshot DB History)
             // Nếu backend của bạn trả về field tên là 'song', hãy sửa 'item.track' thành 'item.song'
             const song = item.track || {}; 

             return (
              <div key={item._id} className="history-item">
                <SongItem
                  // Map đúng trường từ DB Songs (image_ca0d97.png)
                  cover={song.imgUrl || "https://via.placeholder.com/150"} 
                  title={song.title || "Không rõ tên"}
                  // Dùng description làm tên ca sĩ (theo dữ liệu mẫu "Dương Domic")
                  artist={song.description || "Unknown Artist"} 
                  onPlay={() => console.log(`Playing: ${song._id}`)}
                />
                
                {/* Hiển thị thời gian listenedAt từ DB History */}
                <span className="played-time">{formatTime(item.listenedAt)}</span>
              </div>
            );
          })
        )}
      </div>

      {!loading && history.length === 0 && (
        <div className="empty-state">
          <p>Chưa có lịch sử nghe nhạc.</p>
        </div>
      )}
    </div>
  );
}