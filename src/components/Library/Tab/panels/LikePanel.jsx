import { useEffect, useState } from "react";
import SongItem from "../../SongItem/SongItem";
import { dislikeSongAPI, fetchDataLikePanel, likeSongAPI } from "../../../../services/api";
import { useNavigate } from "react-router-dom";

export default function LikePanel(props) {
  const {setChanged, changed}= props;
  const navigate = useNavigate();
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    

    const fetchLikes = async () => {
      try {
        const res = await fetchDataLikePanel();
        if(res && res.data) {
          setLikedSongs(res.data.songs || []);
          // Clear any previous error on successful fetch
          setError("");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [changed]);

  const handleLikeToggle = async (songId) => {
    const res = await likeSongAPI(songId);
    if(res && res.data) {
      alert("Liked song successfully");
      // Clear error state on success
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
      // Remove the unliked song from local state using the provided id
      setLikedSongs(prev => prev.filter(s => s.id !== songId));
      // Clear error state on success
      setChanged(prev => !prev);
      setError("");
      // Notify parent to refresh GeneralPanel stats
    }
    else{
      setError(res.message || "Failed to Unlike song");
    }
  }

  return (
    <div className="like-panel">
      <h3>Liked Songs</h3>
      {loading && <p>Loading liked songs...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <>
          <p>Danh sách bài hát bạn đã like. ({likedSongs.length} bài hát)</p>
          <div className="song-list">
            {likedSongs.length && likedSongs.map(song => (
              <SongItem
                key={song.id}
                cover={song.image || "https://via.placeholder.com/300"}
                title={song.title || "Unknown Title"}
                artist={song.artistName || "Unknown Artist"}
                liked={true}
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
            ))}
          </div>
          {likedSongs.length === 0 && (
            <div className="empty-state">
              <p>Bạn chưa like bài hát nào. Hãy khám phá và thêm những bài hát yêu thích của bạn!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
