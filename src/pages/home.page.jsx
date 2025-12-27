import React, { useEffect, useState } from 'react';
import { Pagination } from 'antd'; // Yêu cầu: npm install antd
import Card from '../components/Card';
import Sidebar from '../components/Sidebar';
import { fetchHomeData } from '../services/api';
import { Link, NavLink } from 'react-router-dom';

const Home = () => {
  // 1. Khởi tạo state với cấu trúc mặc định tránh lỗi undefined khi chưa tải xong
  const [data, setData] = useState({ topSongs: [], allSongs: [] });
  
  // 2. State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Số bài hiển thị trên 1 trang

  // 3. Gọi API lấy dữ liệu khi Component được tải (Mount)
  useEffect(() => {
    const getData = async () => {
      const result = await fetchHomeData();
      
      console.log("Dữ liệu Home từ API:", result); // Log kiểm tra
      
      if (result.data) {
        setData(result.data);
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
    // Cuộn nhẹ lên đầu danh sách bài hát (UX tốt hơn)
    const section = document.getElementById('all-songs-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121216', color: 'white',paddingTop: '20px', paddingBottom: '40px' }}>
      
      {/* CONTAINER CHÍNH */}
      <div 
        className="container" 
        style={{ 
          maxWidth: '1200px', // Giới hạn chiều rộng để giao diện gọn gàng
          margin: '0 auto', 
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
              Discover Tracks and Playlists
            </h1>
          </div>

          {/* Section 1: MUSIC HOT (Lấy từ data.topSongs) */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
              Music Hot
            </h2>
            {/* Thanh trượt ngang (Horizontal Scroll) */}
            <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '15px', gap: '20px' }}>
              {data.topSongs.length > 0 ? (
                data.topSongs.map((item) => (
                  <Link to={`/track/${item._id}`} key={item._id} style={{ textDecoration: 'none' }}>
                    <Card 
                      key={item._id} 
                      id={item._id} // Truyền ID để sau này click vào nghe nhạc
                      image={item.imgUrl} // Cần đảm bảo link ảnh trong DB là link online hoặc nằm trong public
                      title={item.title} 
                      subtitle={item.uploader?.username || "Unknown Artist"} // Populate uploader
                      
                    />
                  </Link>
                ))
              ) : (
                <p style={{ color: '#888' }}>Đang tải bài hát hot...</p>
              )}
            </div>
          </section>

          {/* Section 2: ALL SONGS (Có phân trang) */}
          <section id="all-songs-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
              All Songs
            </h2>
            
            {/* Hiển thị dạng lưới (Grid) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {currentAllSongs.length > 0 ? (
                currentAllSongs.map((item) => (
                  <Card 
                    key={item._id} 
                    id={item._id}
                    image={item.imgUrl} 
                    title={item.title} 
                    subtitle={item.uploader?.username || "Unknown Artist"} 
                  />
                ))
              ) : (
                <p style={{ color: '#888' }}>Không có bài hát nào.</p>
              )}
            </div>

            {/* Component Phân trang của Ant Design */}
            {data.allSongs.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <Pagination
                  current={currentPage}
                  total={data.allSongs.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  // Style: Nền trắng, bo tròn để nổi bật trên nền đen
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


        {/* === CỘT PHẢI (SIDEBAR - LỊCH SỬ NGHE) === */}
        <div style={{ flex: 1, minWidth: '280px', marginTop: '60px' }}>
           <Sidebar />
        </div>
        {/* === HẾT CỘT PHẢI === */}

      </div>
    </div>
  );
};

export default Home;