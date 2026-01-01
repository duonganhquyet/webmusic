import React, { useEffect, useState } from 'react';
import SongItem from "../../SongItem/SongItem";
import { fetchFavoriteSongs } from "../../../../services/api"; // Đã sửa đúng đường dẫn (4 cấp)
import { Link } from 'react-router-dom'; 

export default function LikePanel() {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsLoggedIn(true);
      fetchData();
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchFavoriteSongs();
      setLikedSongs(data);
    } catch (error) {
      console.error("Không thể tải bài hát yêu thích", error);
    } finally {
      setLoading(false);
    }
  };

  // Render khi chưa đăng nhập
  if (!isLoggedIn) {
    return (
      <div className="like-panel" style={{ textAlign: 'center', padding: '40px 20px', color: '#ccc' }}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Liked Songs</h3>
        <p style={{ marginBottom: '20px' }}>Vui lòng đăng nhập để xem các bài hát yêu thích.</p>
        
        {/* --- PHẦN ĐÃ SỬA: GẮN LINK ĐĂNG NHẬP --- */}
        <Link to="/login" style={{ fontWeight: 'bold', color: '#fff', textDecoration: 'underline' }}>
                    Đăng nhập ngay
                  </Link>


      </div>
    );
  }

  return (
    <div className="like-panel">
      <h3>Liked Songs</h3>
      
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <p>Danh sách bài hát bạn đã like. ({likedSongs.length} bài hát)</p>
          
          <div className="song-list">
            {likedSongs.map(song => (
              <SongItem
                key={song._id} 
                cover={song.imgUrl}
                title={song.title}
                artist={song.uploader?.username || "Unknown Artist"} 
                onPlay={() => console.log(`Playing: ${song.title}`)}
              />
            ))}
          </div>

          {!loading && likedSongs.length === 0 && (
            <div className="empty-state">
              <p>Bạn chưa like bài hát nào. Hãy thả tim để lưu bài hát vào đây!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}