import { useEffect, useState } from "react";
import SongItem from "../../SongItem/SongItem";
import { Link } from "react-router-dom";
import { clearUserHistory, dislikeSongAPI, fetchUserHistory, likeSongAPI } from "../../../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../../contexts/auth.context";

export default function HistoryPanel(props) {
  const {setChanged, changed}= props;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {auth} = useAuthContext();
  const isLoggedIn = !!(auth && auth.user && auth.user._id);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchHistory = async () => {
      try {
        const res = await fetchUserHistory();
        if(res && res.data){
          setHistory(res.data.songs || []);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [changed]);

  const handleLikeToggle = async (songId) => {
      const res = await likeSongAPI(songId);
      if(res && res.data) {
        alert("Liked song successfully");
        // Clear error state on success
        setChanged(prev => !prev);
        setError("");
      }
      else{
        setError(res.message || "Failed to like song");
      }
    }
    const handleDislikeToggle = async (songId) => {
      const res = await dislikeSongAPI(songId);
      if(res && res.data) {
        alert("Unlike song successfully");
        // Update local history item's liked state immediately
        setHistory(prev => prev.map(s => s.id === songId ? { ...s, liked: false } : s));
        // Clear error state on success
        setError("");
        // Notify parent to refresh GeneralPanel stats
        setChanged(prev => !prev);
      }
      else{
        setError(res.message || "Failed to Unlike song");
      }
    }

  const handleClearHistory = async () => {
    const ok = confirm("Bạn có chắc muốn xóa toàn bộ lịch sử nghe nhạc?");
    if (!ok) return;

    try {
      const res = await clearUserHistory();
      if(res && res.data){
        alert("Lịch sử nghe nhạc đã được xóa.");
      }
      setHistory([]);
    } catch (err) {
      setError(err.message);
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
          {!loading && !error && (
            <p>Lịch sử nghe nhạc gần đây. ({history.length} bài hát)</p>
          )}
        </div>
        <button className="clear-history-btn" onClick={handleClearHistory}>
          Xóa lịch sử
        </button>
      </div>

      {loading && <p>Tải lịch sử...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="song-list">
            {history.map(song => (
              <div key={song.id} className="history-item">
                <SongItem
                  cover={song.image || "https://via.placeholder.com/300"}
                  title={song.title || "Unknown Title"}
                  artist={song.artistName || "Unknown Artist"}
                  liked={song.liked === true}
                  onPlay={() => navigate(`/track/${song.id}`)}
                  onLike={async (nextLiked) => {
                    if(nextLiked){
                      handleLikeToggle(song.id)
                    }
                    else{
                      handleDislikeToggle(song.id)
                  }
                  }}
                />
                <span className="played-time">
                  {song.listenedAt ? new Date(song.listenedAt).toLocaleString() : ""}
                </span>
              </div>
            ))}
          </div>

          {history.length === 0 && (
            <div className="empty-state">
              <p>Lịch sử nghe nhạc trống. Bắt đầu nghe nhạc để xem lịch sử tại đây!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}