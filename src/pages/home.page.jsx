import React, { useEffect, useState } from 'react';
import { Pagination } from 'antd'; // Yêu cầu: npm install antd
import Card from '../components/Card';
import Sidebar from '../components/Sidebar';
import { fetchHomeData } from '../services/api';
import { Link } from 'react-router-dom';

const Home = () => {
  // 1. Khởi tạo state
  const [data, setData] = useState({ topSongs: [], allSongs: [] });
  
  // 2. State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Số bài hiển thị trên 1 trang

  // 3. Gọi API lấy dữ liệu và Xử lý Logic Top 5
  useEffect(() => {
    const getData = async () => {
      try {
        const result = await fetchHomeData();
        
        // Lấy danh sách tổng từ API (kiểm tra các trường hợp trả về)
        const allSongsData = result.allSongs || result.songs || result.data || [];

        if (Array.isArray(allSongsData) && allSongsData.length > 0) {
          // --- LOGIC TẠO LIST MUSIC HOT ---
          // Copy mảng mới, sắp xếp theo countPlay giảm dần, lấy 5 bài đầu
          const topSongsData = [...allSongsData]
            .sort((a, b) => (b.countPlay || 0) - (a.countPlay || 0))
            .slice(0, 5);

          // Cập nhật State
          setData({
            allSongs: allSongsData,
            topSongs: topSongsData
          });
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu Home:", error);
      }
    };
    getData();
  }, []);

  // 4. Logic Phân trang (Cắt mảng allSongs)
  const indexOfLastSong = currentPage * pageSize;
  const indexOfFirstSong = indexOfLastSong - pageSize;
  const currentAllSongs = data.allSongs.slice(indexOfFirstSong, indexOfLastSong);

  // Hàm xử lý khi bấm số trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Cuộn nhẹ lên đầu danh sách bài hát
    const section = document.getElementById('all-songs-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121216', color: 'white' }}>
      
      {/* CONTAINER CHÍNH */}
      <div 
        className="container" 
        style={{ 
          maxWidth: '1200px', 
          margin: '30px auto', 
          padding: '0 20px', 
          display: 'flex',
          gap: '30px',
          alignItems: 'flex-start' 
        }}
      >
        
        {/* === CỘT TRÁI (NỘI DUNG CHÍNH) === */}
        <div style={{ flex: 3, width: '70%' }}> 
          
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              Welcome to WebNhac
            </h1>
          </div>

          {/* Section 1: MUSIC HOT (Top 5 views) */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
              Music Hot
            </h2>
            {/* Thanh trượt ngang */}
            <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '15px', gap: '20px' }}>
              {data.topSongs.length > 0 ? (
                data.topSongs.map((item) => (
                  <Link to={`/track/${item._id}`} key={item._id} style={{ textDecoration: 'none' }}>
                    <Card 
                      key={item._id} 
                      id={item._id} 
                      image={item.imgUrl} 
                      title={item.title} 
                      // Ưu tiên hiển thị: Name > Username > Description > Unknown
                      subtitle={item.uploader?.name || item.uploader?.username || item.description || "Unknown Artist"} 
                    />
                  </Link>
                ))
              ) : (
                <p style={{ color: '#888', fontStyle: 'italic' }}>Đang tải bài hát hot...</p>
              )}
            </div>
          </section>

          {/* Section 2: ALL SONGS (Có phân trang) */}
          <section id="all-songs-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
              All Songs
            </h2>
            
            {/* Hiển thị dạng lưới */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {currentAllSongs.length > 0 ? (
                currentAllSongs.map((item) => (
                  <Card 
                    key={item._id} 
                    id={item._id}
                    image={item.imgUrl} 
                    title={item.title} 
                    subtitle={item.uploader?.name || item.uploader?.username || item.description || "Unknown Artist"} 
                  />
                ))
              ) : (
                <p style={{ color: '#888', fontStyle: 'italic' }}>Không có bài hát nào.</p>
              )}
            </div>

            {/* Component Phân trang */}
            {data.allSongs.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <Pagination
                  current={currentPage}
                  total={data.allSongs.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    padding: '8px 16px', 
                    borderRadius: '25px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}
                />
              </div>
            )}
          </section>
        </div>
        {/* === HẾT CỘT TRÁI === */}


        {/* === CỘT PHẢI (SIDEBAR) === */}
        <div style={{ flex: 1, minWidth: '280px', marginTop: '60px' }}>
           <Sidebar />
        </div>
        {/* === HẾT CỘT PHẢI === */}

      </div>
    </div>
  );
};

export default Home;