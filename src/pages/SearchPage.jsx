import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../assets/SearchPage.css"; 
import { resolveAssetUrl } from "../utils/url";

const API_BASE = "http://localhost:8080";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const queryFromURL = searchParams.get("q") || "";

  const [lastQuery, setLastQuery] = useState("");
  const [filter, setFilter] = useState("everything");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const doSearch = async (searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      const songsData = data.data || data.songs || (Array.isArray(data) ? data : []);
      
      setResults(songsData);
      setLastQuery(searchTerm);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryFromURL) {
      doSearch(queryFromURL);
    }
  }, [queryFromURL]);

  const goToTrackPage = (trackId) => {
      navigate(`/track/${trackId}`);
  };

  const renderResults = () => {
    if (loading) return <p className="loading-text">Loading...</p>;
    if (!results || results.length === 0) return <p className="empty-text">No results found for "{queryFromURL}".</p>;

    let filteredList = results;
    if (filter === "artists") {
       filteredList = results.filter(s => 
         s.description && s.description.toLowerCase().includes(lastQuery.toLowerCase())
       );
    } else if (filter === "genres") {
       filteredList = results.filter(s => 
         s.category && s.category.toLowerCase().includes(lastQuery.toLowerCase())
       );
    }

    return (
        <div className="results-grid">
            {filteredList.map((track) => (
                <TrackCard 
                    key={track._id} 
                    track={track} 
                    onClick={() => goToTrackPage(track._id)} 
                />
            ))}
        </div>
    );
  };

  return (
    // 👇 Tăng paddingTop lên 120px (46px Header + 60px SubHeader + khoảng hở)
    <div className="search-page" style={{ paddingTop: "120px", paddingLeft: "20px", paddingRight: "20px" }}>
      
      {/* 👇 KHU VỰC CỐ ĐỊNH (FIXED SUB-HEADER) */}
      <div style={{ 
          position: "fixed",
          top: "46px",      /* Nằm ngay dưới Header chính (46px) */
          left: 0,
          right: 0,
          height: "60px",   /* Chiều cao thanh tiêu đề phụ */
          backgroundColor: "#111", /* Màu nền tối để che nội dung khi cuộn */
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "0 30px",
          zIndex: 900,      /* Nổi lên trên danh sách bài hát */
          borderBottom: "1px solid #222",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
      }}>
          <h3 className="search-title" style={{ color: "white", fontSize: "20px", margin: 0 }}>
              Results for: <span style={{ color: "#f50" }}>"{lastQuery}"</span>
          </h3>

          {/* Nút X nằm góc phải */}
          <button 
            onClick={() => navigate("/")}
            title="Close Search"
            style={{
                background: "transparent",
                border: "1px solid #444",
                color: "#ccc",
                fontSize: "24px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
                e.target.style.borderColor = "white";
                e.target.style.color = "white";
                e.target.style.background = "#333";
            }}
            onMouseLeave={(e) => {
                e.target.style.borderColor = "#444";
                e.target.style.color = "#ccc";
                e.target.style.background = "transparent";
            }}
          >
            ×
          </button>
      </div>
      {/* 👆 KẾT THÚC KHU VỰC CỐ ĐỊNH */}

      <div className="filters">
        {["everything", "tracks", "artists", "genres"].map((f) => (
          <button 
            key={f} 
            className={`filter-btn ${filter === f ? "active" : ""}`} 
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="results-container">{renderResults()}</div>
    </div>
  );
}

// Component hiển thị từng bài hát (Xử lý ảnh bìa chuyên nghiệp hơn)
function TrackCard({ track, onClick }) {
  // Kiểm tra xem bài hát có ảnh không
  const hasImage = track.imgUrl && track.imgUrl.trim() !== "";

  return (
    <div 
        className="track-card" 
        onClick={onClick} 
        style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            borderBottom: '1px solid #333',
            gap: '15px' 
        }}
    >
        {/* 1. Phần Ảnh bìa hoặc Placeholder */}
        <div className="track-img-wrapper" style={{ width: '60px', height: '60px', flexShrink: 0 }}>
          
          {hasImage ? (
            // TRƯỜNG HỢP 1: CÓ ẢNH -> Hiển thị ảnh
            <img 
              src={resolveAssetUrl(track.imgUrl)} 
              className="track-cover" 
              alt={track.title}
              style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  borderRadius: '4px' 
              }} 
              // Nếu ảnh bị lỗi (link hỏng), tự động ẩn ảnh đi và hiện khung placeholder bên dưới
              onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}

          {/* TRƯỜNG HỢP 2: KHÔNG CÓ ẢNH (Placeholder) 
              Mặc định ẩn nếu có ảnh (display: hasImage ? 'none' : 'flex')
              nhưng sẽ hiện lên nếu ảnh trên bị lỗi hoặc không có ảnh.
          */}
          <div 
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#222', 
                borderRadius: '4px',
                display: hasImage ? 'none' : 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #333'
            }}
          >
             {/* Icon Nốt nhạc (SVG) */}
             <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#666" // Màu của nốt nhạc
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
             >
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
             </svg>
          </div>

        </div>

        {/* 2. Phần Thông tin */}
        <div className="track-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="track-title" style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#fff', 
                marginBottom: '4px',
                lineHeight: '1.2'
            }}>
                {track.title}
            </div>
            
            <div className="track-artist-line" style={{ 
                fontSize: '14px', 
                color: '#aaa' 
            }}>
                {track.description || "Unknown Artist"}
            </div>
        </div>
    </div>
  );
}