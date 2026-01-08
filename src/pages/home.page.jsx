// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Pagination } from 'antd'; 
import Card from '../components/Card';
import HistoryTrack from '../components/historyTrack';
import { fetchHomeData } from '../services/api';
import { Link, NavLink } from 'react-router-dom';
import { useAuthContext } from '../contexts/auth.context';
import { resolveAssetUrl } from '../utils/url';

// ✅ 1. Khai báo địa chỉ Server Backend
const API_BASE = "http://localhost:8080";

const Home = () => {
  // 1. Khởi tạo state
  const [data, setData] = useState({ topSongs: [], allSongs: [] });
  const {auth} = useAuthContext();
  const isLoggedIn = !!(auth && auth.user && auth.user._id);
  const [loading, setLoading] = useState(true); 
  
  // 2. State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; 

  // 3. Gọi API và Xử lý dữ liệu
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const result = await fetchHomeData();
        console.log("Home API result:", result);

        // Unwrap common response shapes
        const payload = (result && typeof result === 'object' && 'data' in result)
          ? result.data
          : result;

        // Extract arrays regardless of shape
        let allSongsData = [];
        let topSongsData = [];

        if (Array.isArray(payload)) {
          // API returned a plain array
          allSongsData = payload;
        } else if (payload && typeof payload === 'object') {
          // API returned an object containing arrays
          if (Array.isArray(payload.allSongs)) allSongsData = payload.allSongs;
          else if (Array.isArray(payload.songs)) allSongsData = payload.songs;

          if (Array.isArray(payload.topSongs)) topSongsData = payload.topSongs;
        }

        // Fallback: compute top songs from all songs if not provided
        if ((!topSongsData || topSongsData.length === 0) && allSongsData.length > 0) {
          topSongsData = [...allSongsData]
            .sort((a, b) => (b.countPlay || 0) - (a.countPlay || 0))
            .slice(0, 5);
        }

        if (allSongsData.length > 0 || topSongsData.length > 0) {
          setData({
            allSongs: allSongsData,
            topSongs: topSongsData
          });
        } else {
          console.warn("API kết nối được nhưng mảng rỗng hoặc sai cấu trúc");
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu Home:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  // 4. Logic Phân trang
  const indexOfLastSong = currentPage * pageSize;
  const indexOfFirstSong = indexOfLastSong - pageSize;
  const currentAllSongs = data.allSongs.slice(indexOfFirstSong, indexOfLastSong);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const section = document.getElementById('all-songs-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Hàm lấy phụ đề an toàn
  const getSubtitle = (item) => {
     if (item.uploader && typeof item.uploader === 'object' && item.uploader.name) {
         return item.uploader.name;
     }
     return item.description || "Unknown Artist";
  };

  // ✅ 2. Dùng resolver chung cho ảnh
  const getImageUrl = (path) => resolveAssetUrl(path) || "/default-cover.png";

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121216', color: 'white', paddingTop: '20px', paddingBottom: '40px' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* === CỘT TRÁI (Nội dung chính) === */}
        <div style={{ flex: 3, width: '70%' }}> 
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Welcome to WebNhac</h1>
          </div>

          {/* Section 1: MUSIC HOT */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
              Music Hot (Top Views)
            </h2>
            <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '15px', gap: '20px' }}>
              {loading ? (
                 <p style={{color: '#888'}}>Đang tải dữ liệu...</p>
              ) : data.topSongs.length > 0 ? (
                data.topSongs.map((item) => (
                  <Link to={`/track/${item._id}`} key={item._id} style={{ textDecoration: 'none' }}>
                    <Card 
                      id={item._id} 
                      // ✅ Áp dụng hàm xử lý ảnh ở đây
                      image={getImageUrl(item.imgUrl)} 
                      title={item.title} 
                      subtitle={getSubtitle(item)} 
                    />
                  </Link>
                ))
              ) : (
                <p style={{ color: '#888', fontStyle: 'italic' }}>Không tìm thấy bài hát nào.</p>
              )}
            </div>
          </section>

          {/* Section 2: ALL SONGS */}
          <section id="all-songs-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
              All Songs
            </h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {currentAllSongs.length > 0 ? (
                currentAllSongs.map((item) => (
                  <Link to={`/track/${item._id}`} key={item._id} style={{ textDecoration: 'none' }}>
                    <Card 
                        id={item._id}
                        // ✅ Áp dụng hàm xử lý ảnh ở đây
                        image={getImageUrl(item.imgUrl)} 
                        title={item.title} 
                        subtitle={getSubtitle(item)} 
                    />
                  </Link>
                ))
              ) : (
                 !loading && <p style={{ color: '#888', fontStyle: 'italic' }}>Danh sách trống.</p>
              )}
            </div>

            {/* Pagination */}
            {data.allSongs.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <Pagination
                  current={currentPage}
                  total={data.allSongs.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  // Lưu ý: Nếu phiên bản Antd mới nhất không nhận theme="dark", hãy dùng ConfigProvider hoặc CSS tùy chỉnh
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '8px 16px', borderRadius: '25px' }}
                />
              </div>
            )}
          </section>
        </div>


        {/* === CỘT PHẢI (SIDEBAR - LỊCH SỬ NGHE) === */}

          <div style={{ flex: 1, minWidth: '280px', marginTop: '60px' }}>
           <HistoryTrack />
          </div>
        
        
        {/* === HẾT CỘT PHẢI === */}

      </div>
    </div>
  );
};

export default Home;