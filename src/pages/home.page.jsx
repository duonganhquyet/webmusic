import React, { useEffect, useState } from 'react';
import { Pagination } from 'antd'; 
import Card from '../components/Card';
import HistoryTrack from '../components/historyTrack';
import MusicHotSlider from '../components/MusicHotSlider'; 
import { fetchHomeData } from '../services/api';
import { Link } from 'react-router-dom';

const API_BASE = "http://localhost:8080";

const Home = () => {
  const [data, setData] = useState({ topSongs: [], allSongs: [] });
  const [loading, setLoading] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15; // ✅ Tăng lên 15 bài để chia hết cho 5 (5 bài x 3 dòng = 15)

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const result = await fetchHomeData();
        const payload = (result && typeof result === 'object' && 'data' in result) ? result.data : result;

        let allSongsData = [];
        let topSongsData = [];

        if (Array.isArray(payload)) {
          allSongsData = payload;
        } else if (payload && typeof payload === 'object') {
          if (Array.isArray(payload.allSongs)) allSongsData = payload.allSongs;
          else if (Array.isArray(payload.songs)) allSongsData = payload.songs;
          if (Array.isArray(payload.topSongs)) topSongsData = payload.topSongs;
        }

        if ((!topSongsData || topSongsData.length === 0) && allSongsData.length > 0) {
          topSongsData = [...allSongsData]
            .sort((a, b) => (b.countPlay || 0) - (a.countPlay || 0))
            .slice(0, 10);
        }

        if (allSongsData.length > 0 || topSongsData.length > 0) {
          setData({ allSongs: allSongsData, topSongs: topSongsData });
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const indexOfLastSong = currentPage * pageSize;
  const indexOfFirstSong = indexOfLastSong - pageSize;
  const currentAllSongs = data.allSongs.slice(indexOfFirstSong, indexOfLastSong);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const section = document.getElementById('all-songs-section');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getSubtitle = (item) => {
     if (item.description && item.description.trim() !== "" && item.description !== "Unknown Artist") return item.description;
     if (item.uploader?.name) return item.uploader.name;
     return "Unknown Artist";
  };

  const getImageUrl = (path) => {
    if (!path) return "/default-cover.png"; 
    if (path.startsWith("http")) return path; 
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121216', color: 'white', paddingTop: '20px', paddingBottom: '40px' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* === CỘT TRÁI === */}
        <div style={{ flex: 3, width: '70%' }}> 
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Welcome to WebNhac</h1>
          </div>

          {/* Section 1: MUSIC HOT */}
          <section style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
              Music Hot (Top Views)
            </h2>
            {!loading && <MusicHotSlider songs={data.topSongs} getImageUrl={getImageUrl} getSubtitle={getSubtitle} />}
          </section>

          {/* Section 2: ALL SONGS */}
          <section id="all-songs-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
              All Songs
            </h2>
            
            {/* ✅ CỐ ĐỊNH 5 BÀI TRÊN 1 DÒNG */}
            <div style={{ 
              display: 'grid', 
              // Số 5fr nghĩa là 5 cột. Muốn 6 bài thì sửa thành repeat(6, 1fr)
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '20px' 
            }}>
              {currentAllSongs.length > 0 ? (
                currentAllSongs.map((item) => (
                  // Không cần set width ở đây, Grid sẽ tự chia
                  <div key={item._id}> 
                    <Link to={`/track/${item._id}`} style={{ textDecoration: 'none' }}>
                      <Card 
                          id={item._id}
                          image={getImageUrl(item.imgUrl)} 
                          title={item.title} 
                          subtitle={getSubtitle(item)} 
                      />
                    </Link>
                  </div>
                ))
              ) : (
                 !loading && <p style={{ color: '#888' }}>Danh sách trống.</p>
              )}
            </div>

            {/* Phân trang */}
            {data.allSongs.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                <Pagination
                  current={currentPage}
                  total={data.allSongs.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '8px 16px', borderRadius: '25px' }}
                />
              </div>
            )}
          </section>
        </div>

        {/* === CỘT PHẢI === */}
        <div style={{ flex: 1, minWidth: '280px', marginTop: '60px' }}>
           <HistoryTrack />
        </div>
        
      </div>
    </div>
  );
};

export default Home;