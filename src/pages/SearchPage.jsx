import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
// Lưu ý: Nếu báo lỗi không tìm thấy file css, hãy tạo file rỗng hoặc xóa dòng dưới
import "../assets/SearchPage.css"; 

// QUAN TRỌNG: Đã sửa thành 8080 (Trước đây bạn để 5000 gây lỗi)
const API_BASE = "http://localhost:8080";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [lastQuery, setLastQuery] = useState("");
  const [filter, setFilter] = useState("everything");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const wavesurferRef = useRef(null);
  const waveformBox = useRef(null);

  const doSearch = async (searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      const songsData = data.songs || data.tracks || (Array.isArray(data) ? data : []);
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

  // --- PLAYER LOGIC ---
  useEffect(() => {
    if (!currentTrack) return;
    if (wavesurferRef.current) wavesurferRef.current.destroy();

    wavesurferRef.current = WaveSurfer.create({
      container: waveformBox.current,
      waveColor: "#999",
      progressColor: "#ff5500",
      height: 50,
      barWidth: 2,
      responsive: true,
      cursorWidth: 1,
    });

    const trackSrc = currentTrack.trackUrl.startsWith("http")
      ? currentTrack.trackUrl
      : `${API_BASE}${currentTrack.trackUrl.startsWith("/") ? "" : "/"}${currentTrack.trackUrl}`;

    wavesurferRef.current.load(trackSrc);

    wavesurferRef.current.on("ready", () => {
      wavesurferRef.current.play();
      setIsPlaying(true);
    });

    wavesurferRef.current.on("finish", () => setIsPlaying(false));

    return () => {
        if(wavesurferRef.current) wavesurferRef.current.destroy();
    }
  }, [currentTrack]);

  const playTrack = (track) => setCurrentTrack(track);

  const togglePlay = () => {
    if (!wavesurferRef.current) return;
    if (isPlaying) {
      wavesurferRef.current.pause();
      setIsPlaying(false);
    } else {
      wavesurferRef.current.play();
      setIsPlaying(true);
    }
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
                <TrackCard key={track._id} track={track} onPlay={() => playTrack(track)} />
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

      {currentTrack && (
        <div className="player-bar">
          <img src={currentTrack.imgUrl ? (currentTrack.imgUrl.startsWith("http") ? currentTrack.imgUrl : `${API_BASE}${currentTrack.imgUrl.startsWith("/")?"":"/"}${currentTrack.imgUrl}`) : "/default-cover.png"} className="player-cover" alt="" />
          <div className="player-info">
            <div className="player-title">{currentTrack.title}</div>
            <div className="player-artist">{currentTrack.description}</div>
          </div>
          <button className="play-btn" onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button>
          <div className="waveform" ref={waveformBox}></div>
        </div>
      )}
    </div>
  );
}

function TrackCard({ track, onPlay }) {
  const getCoverUrl = (path) => {
      if (!path) return "/default-cover.png";
      if (path.startsWith("http")) return path;
      return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  return (
    <div className="track-card">
      <div className="track-img-wrapper">
          <img src={getCoverUrl(track.imgUrl)} className="track-cover" alt={track.title} />
          <div className="overlay"><button className="card-play-btn" onClick={onPlay}>▶</button></div>
      </div>
      <div className="track-info">
        <div className="track-title">{track.title}</div>
        <div className="track-artist-line">{track.description}</div>
      </div>
    </div>
  );
}