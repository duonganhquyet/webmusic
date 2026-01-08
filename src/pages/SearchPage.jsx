import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
// Đã xóa import WaveSurfer vì không dùng player ở trang này nữa
import "../assets/SearchPage.css"; 
import { resolveAssetUrl } from "../utils/url";

const API_BASE = "http://localhost:8080";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [lastQuery, setLastQuery] = useState("");
  const [filter, setFilter] = useState("everything");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- XÓA CÁC STATE LIÊN QUAN ĐẾN PLAYER (currentTrack, isPlaying...) ---

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
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setQuery(urlQuery);
      doSearch(urlQuery);
    }
  }, [searchParams]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleManualSearch = () => {
      navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  // --- HÀM CHUYỂN TRANG KHI CLICK ---
  const goToTrackPage = (trackId) => {
      navigate(`/track/${trackId}`);
  };

  const renderResults = () => {
    if (loading) return <p className="loading-text">Loading...</p>;
    if (!results || results.length === 0) return <p className="empty-text">No results found.</p>;

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
                    onClick={() => goToTrackPage(track._id)} // Truyền hàm chuyển trang
                />
            ))}
        </div>
    );
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <input className="search-input" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} />
        <button className="search-btn" onClick={handleManualSearch}>Search</button>
        <button className="home-btn" onClick={() => navigate("/")}>×</button>
      </div>

      {lastQuery && <h3 className="search-title">Results for: <span>"{lastQuery}"</span></h3>}

      <div className="filters">
        {["everything", "tracks", "artists", "genres"].map((f) => (
          <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
        ))}
      </div>

      <div className="results-container">{renderResults()}</div>

      {/* Đã xóa phần <div className="player-bar"> vì không cần thiết nữa */}
    </div>
  );
}

// Sửa lại Component TrackCard để nhận sự kiện onClick toàn thẻ
function TrackCard({ track, onClick }) {

  return (
    // Thêm onClick vào div bao ngoài để bấm vào đâu cũng chuyển trang
    <div className="track-card" onClick={onClick} style={{cursor: 'pointer'}}>
        <div className="track-img-wrapper">
          <img src={resolveAssetUrl(track.imgUrl) || "/default-cover.png"} className="track-cover" alt={track.title} />
          {/* Nút Play giờ chỉ mang tính biểu tượng, bấm vào cũng kích hoạt onClick của cha */}
          <div className="overlay">
            <button className="card-play-btn">▶</button>
          </div>
      </div>
      <div className="track-info">
        <div className="track-title">{track.title}</div>
        <div className="track-artist-line">{track.description}</div>
      </div>
    </div>
  );
}