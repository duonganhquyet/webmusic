import { useEffect, useState, useRef } from "react";
import SongItem from "../../SongItem/SongItem";
import { dislikeSongAPI, fetchDataLikePanel, likeSongAPI } from "../../../../services/api";
import { notifyError, notifySuccess, notifyOpen, notifyDestroy } from "../../../../utils/notification";
import { useNavigate } from "react-router-dom";
import { resolveAssetUrl } from "../../../../utils/url";
import AddToPlaylistModal from "../../../Library/AddToPlaylistModal.jsx";

export default function LikePanel(props) {
  const {setChanged, changed}= props;
  const navigate = useNavigate();
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingUnlikes, setPendingUnlikes] = useState(new Set());
  const timersRef = useRef({});
  const intervalsRef = useRef({});
  const [addModalForSong, setAddModalForSong] = useState(null);

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
      notifySuccess('Lượt thích', 'Đã like bài hát');
      // Clear error state on success
      setError("");
    }
    else{
      const msg = res.message || "Failed to like song";
      setError(msg);
      notifyError('Lượt thích', msg);
    }
  }
  const scheduleDislikeWithUndo = (songId) => {
    // mark as pending
    setPendingUnlikes(prev => {
      const next = new Set(prev);
      next.add(songId);
      return next;
    });

    const key = `undo-unlike-${songId}`;
    // countdown 5 → 0 and update notification content
    let remaining = 5;
    const renderDesc = (n) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Đã bỏ thích. Hoàn tác trong</span>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{n}</span>
      </div>
    );

    const renderBtn = (
      <button
        style={{ border: 'none', background: '#1677ff', color: '#fff', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}
        onClick={() => {
          const t = timersRef.current[songId];
          if (t) {
            clearTimeout(t);
            delete timersRef.current[songId];
          }
          const iv = intervalsRef.current[songId];
          if (iv) {
            clearInterval(iv);
            delete intervalsRef.current[songId];
          }
          setPendingUnlikes(prev => {
            const next = new Set(prev);
            next.delete(songId);
            return next;
          });
          notifyDestroy(key);
          notifySuccess('Lượt thích', 'Đã khôi phục trạng thái thích');
        }}
      >
        Hoàn tác
      </button>
    );

    notifyOpen({
      message: 'Bỏ thích?',
      description: renderDesc(remaining),
      placement: 'topRight',
      key,
      duration: 0,
      btn: renderBtn,
    });

    intervalsRef.current[songId] = setInterval(() => {
      remaining = Math.max(remaining - 1, 0);
      notifyOpen({ message: 'Bỏ thích?', description: renderDesc(remaining), placement: 'topRight', key, duration: 0, btn: renderBtn });
      if (remaining === 0) {
        clearInterval(intervalsRef.current[songId]);
        delete intervalsRef.current[songId];
      }
    }, 1000);

    // start timer to actually call API after 5s
    timersRef.current[songId] = setTimeout(async () => {
      delete timersRef.current[songId];
      const iv = intervalsRef.current[songId];
      if (iv) {
        clearInterval(iv);
        delete intervalsRef.current[songId];
      }
      notifyDestroy(key);
      const res = await dislikeSongAPI(songId);
      if(res && res.data) {
        notifySuccess('Lượt thích', 'Đã bỏ like bài hát');
        setLikedSongs(prev => prev.filter(s => s.id !== songId));
        setChanged(prev => !prev);
        setError("");
      } else {
        const msg = res?.message || 'Failed to Unlike song';
        setError(msg);
        notifyError('Lượt thích', msg);
        // rollback pending state
        setPendingUnlikes(prev => {
          const next = new Set(prev);
          next.delete(songId);
          return next;
        });
      }
    }, 5000);
  };

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
                cover={resolveAssetUrl(song.image) || "https://via.placeholder.com/300"}
                title={song.title || "Unknown Title"}
                artist={song.artistName || "Unknown Artist"}
                liked={!pendingUnlikes.has(song.id)}
                onPlay={() => navigate(`/track/${song.id}`)}
                onCopy={async () => {
                  const url = `${window.location.origin}/track/${song.id}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    notifySuccess('Sao chép', 'Đã sao chép liên kết bài hát');
                  } catch (e) {
                    notifyError('Sao chép', 'Không thể sao chép liên kết');
                  }
                }}
                onAddToPlaylist={() => setAddModalForSong(song.id)}
                onLike={async (nextLiked) => {
                  if(nextLiked){
                    // If previously scheduled unlike, cancel it
                    const t = timersRef.current[song.id];
                    if (t) {
                      clearTimeout(t);
                      delete timersRef.current[song.id];
                      setPendingUnlikes(prev => {
                        const next = new Set(prev);
                        next.delete(song.id);
                        return next;
                      });
                      notifySuccess('Lượt thích', 'Đã khôi phục trạng thái thích');
                    } else {
                      handleLikeToggle(song.id);
                    }
                  }
                  else{
                    scheduleDislikeWithUndo(song.id)
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
      {addModalForSong && (
        <AddToPlaylistModal
          trackId={addModalForSong}
          onClose={() => setAddModalForSong(null)}
          onAdded={() => setAddModalForSong(null)}
        />
      )}
    </div>
  );
}
