import { useEffect, useRef, useState } from "react";
import "./PlaylistPanel.css";
import PlaylistCreateModal from "./PlaylistCreateModal.jsx";
import SongItem from "../../SongItem/SongItem";
import { useNavigate } from "react-router-dom";
import { createUserPlaylist, fetchPlaylistTracks, fetchUserPlaylists, uploadPlaylistCover, likeSongAPI, dislikeSongAPI, deletePlaylist, removeTrackFromPlaylist } from "../../../../services/api.js";
import { notifyError, notifySuccess, notifyWarning, notifyOpen, notifyDestroy } from "../../../../utils/notification";
import PlaylistEditModal from "./PlaylistEditModal.jsx";
import { resolveAssetUrl } from "../../../../utils/url";

export default function PlaylistPanel() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [songsError, setSongsError] = useState("");
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [pendingRemovals, setPendingRemovals] = useState(new Set());
  const timersRef = useRef({});
  const intervalsRef = useRef({});
  // removed pending removal logic

  

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetchUserPlaylists();
        if(res && res.data) {
          setPlaylists(res.data || []);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  // Sync edit form when switching active playlist
  useEffect(() => {
    if (activePlaylist) {
      setForm({ title: activePlaylist.title || "", description: activePlaylist.description || "" });
      setEditing(false);
    } else {
      setForm({ title: "", description: "" });
      setEditing(false);
    }
  }, [activePlaylist]);

  // When a playlist is selected, fetch its songs
  useEffect(() => {
    const loadSongs = async () => {
      if (!activePlaylist?._id) {
        setPlaylistSongs([]);
        setSongsError("");
        setSongsLoading(false);
        return;
      }
      setSongsLoading(true);
      setSongsError("");
      try {
        const res = await fetchPlaylistTracks(activePlaylist._id);
        if (res && res.data) {
          setPlaylistSongs(res.data.songs || []);
        }
      } catch (err) {
        setSongsError(err.message || "Failed to load songs");
      } finally {
        setSongsLoading(false);
      }
    };

    loadSongs();
  }, [activePlaylist]);

  // Listen for added track events to update counts in real-time
  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {};
      const pid = detail.playlistId || detail.playlist?._id || detail.playlist?.id;
      const updatedPlaylist = detail.playlist;
      if (!pid) return;

      setPlaylists((prev) => prev.map((p) => {
        const id = p._id || p.id;
        if (String(id) !== String(pid)) return p;
        if (updatedPlaylist && Array.isArray(updatedPlaylist.tracks)) {
          // Replace tracks with fresh array from server
          return { ...p, tracks: updatedPlaylist.tracks };
        }
        // Fallback: increment count locally
        if (Array.isArray(p.tracks)) {
          return { ...p, tracks: [...p.tracks, { track: 'added', addedAt: new Date() }] };
        }
        return { ...p, tracksCount: (p.tracksCount || 0) + 1 };
      }));
    };
    window.addEventListener('playlist:track-added', handler);
    return () => window.removeEventListener('playlist:track-added', handler);
  }, []);

  return (
    <div className="playlist-panel">
      <div className="panel-header">
        <div>
          <h3>
            {activePlaylist ? (
              <>
                <span
                  style={{ cursor: 'pointer', textDecoration: 'none' }}
                  onClick={() => setActivePlaylist(null)}
                >
                  Playlists
                </span>
                <span> {'>'} </span>
                <span>{activePlaylist?.title || 'Playlist'}</span>
              </>
            ) : (
              'Playlists'
            )}
          </h3>
          {!activePlaylist && !loading && !error && (
            <p>Danh sách playlist của bạn hoặc đã subscribe. ({playlists.length} playlists)</p>
          )}
          {activePlaylist && !songsLoading && !songsError && (
            <>
              <p>Danh sách bài hát trong playlist. ({playlistSongs.length} bài hát)</p>
              {activePlaylist?.description && (
                <p className="playlist-desc" style={{ opacity: 0.9 }}>{activePlaylist.description}</p>
              )}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!activePlaylist && (
            <button className="create-playlist-btn" onClick={() => setShowCreate(true)}>
              + Create Playlist
            </button>
          )}
          {activePlaylist && (
            <>
              <button
                className="btn danger"
                title="Xóa playlist"
                onClick={async () => {
                  const ok = confirm('Xóa playlist này? Hành động không thể hoàn tác.');
                  if (!ok) return;
                  try {
                    const res = await deletePlaylist(activePlaylist._id || activePlaylist.id);
                    if (res && res.statusCode === 200) {
                      notifySuccess('Playlist', 'Đã xóa playlist');
                      setPlaylists(prev => prev.filter(p => String(p._id||p.id) !== String(activePlaylist._id||activePlaylist.id)));
                      setActivePlaylist(null);
                    } else {
                      notifyError('Playlist', res?.message || 'Xóa playlist thất bại');
                    }
                  } catch (err) {
                    notifyError('Playlist', err.message || 'Xóa playlist thất bại');
                  }
                }}
              >🗑️</button>
              <button
                className="btn secondary"
                title="Sửa playlist"
                onClick={() => setEditing(e => !e)}
              >✎</button>
            </>
          )}
        </div>
      </div>

      {!activePlaylist && loading && <p>Loading playlists...</p>}
      {!activePlaylist && error && <p style={{ color: "red" }}>{error}</p>}

      {!activePlaylist && !loading && !error && (
        <>
          <div className="playlist-grid">
            {playlists.map(pl => (
              <div key={pl?._id} className="playlist-card" onClick={() => setActivePlaylist(pl)}>
                <div className="playlist-cover">
                  <img src={resolveAssetUrl(pl?.imgUrl) || "/default-cover.png"} alt={pl?.title} />
                  <div className="playlist-overlay">
                    <button className="play-btn">▶</button>
                  </div>
                </div>
                <div className="playlist-info">
                  <h4>{pl?.title}</h4>
                  <p>{(pl?.tracks?.length || pl?.tracksCount || 0)} songs</p>
                  <span className="playlist-badge">
                    {pl?.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {playlists.length === 0 && (
            <div className="empty-state">
              <p>Bạn chưa có playlist nào. Tạo playlist đầu tiên của bạn ngay!</p>
              <button className="create-playlist-btn" onClick={() => setShowCreate(true)}>+ Create Playlist</button>
            </div>
          )}
        </>
      )}

      {activePlaylist && (
        <>
          {editing && activePlaylist && (
            <PlaylistEditModal
              playlist={activePlaylist}
              onClose={() => setEditing(false)}
              onUpdated={(updated) => {
                setPlaylists(prev => prev.map(p => (String(p._id||p.id) === String(updated._id||updated.id) ? { ...p, ...updated } : p)));
                setActivePlaylist(ap => ({ ...(ap || {}), ...updated }));
              }}
            />
          )}
          {/* Hero cover under header and song count */}
          <div className="playlist-hero">
            <img src={resolveAssetUrl(activePlaylist?.imgUrl) || "/default-cover.png"} alt={activePlaylist?.title || "Playlist cover"} />
          </div>
          {songsLoading && <p>Loading songs...</p>}
          {songsError && <p style={{ color: 'red' }}>{songsError}</p>}
          {!songsLoading && !songsError && (
            <div className="song-list">
              {playlistSongs.map((s) => {
                const sid = s.id || s._id;
                return (
                  <SongItem
                    key={sid}
                    cover={resolveAssetUrl(s.imgUrl || s.image) || "https://via.placeholder.com/300"}
                    title={s.title || 'Unknown Title'}
                    artist={s.artistName || 'Unknown Artist'}
                    liked={!!s.liked}
                    onPlay={() => navigate(`/track/${sid}`)}
                    onLike={async (nextLiked) => {
                      try {
                        if (nextLiked) {
                          const res = await likeSongAPI(sid);
                          if (!(res && res.data)) throw new Error(res?.message || 'Like failed');
                        } else {
                          const res = await dislikeSongAPI(sid);
                          if (!(res && res.data)) throw new Error(res?.message || 'Unlike failed');
                        }
                        // reflect change locally
                        setPlaylistSongs(prev => prev.map(x => (String(x.id||x._id) === String(sid) ? { ...x, liked: nextLiked } : x)));
                      } catch (err) {
                        notifyError('Lượt thích', err.message || 'Có lỗi xảy ra');
                      }
                    }}
                    onCopy={async () => {
                      const url = `${window.location.origin}/track/${sid}`;
                      try {
                        await navigator.clipboard.writeText(url);
                        notifySuccess('Sao chép', 'Đã sao chép liên kết bài hát');
                      } catch (e) {
                        notifyError('Sao chép', 'Không thể sao chép liên kết');
                      }
                    }}
                    onDelete={() => {
                      setPendingRemovals(prev => {
                        const next = new Set(prev);
                        next.add(sid);
                        return next;
                      });

                      const key = `undo-remove-${sid}`;
                      let remaining = 5;
                      const renderDesc = (n) => (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>Đã chọn xóa khỏi playlist. Hoàn tác trong</span>
                          <span style={{ fontWeight: 700, fontSize: 16 }}>{n}</span>
                        </div>
                      );

                      const undoBtn = (
                        <button
                          style={{ border: 'none', background: '#1677ff', color: '#fff', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}
                          onClick={() => {
                            const t = timersRef.current[sid];
                            if (t) {
                              clearTimeout(t);
                              delete timersRef.current[sid];
                            }
                            const iv = intervalsRef.current[sid];
                            if (iv) {
                              clearInterval(iv);
                              delete intervalsRef.current[sid];
                            }
                            setPendingRemovals(prev => {
                              const next = new Set(prev);
                              next.delete(sid);
                              return next;
                            });
                            notifyDestroy(key);
                            notifySuccess('Playlist', 'Đã hủy thao tác xóa');
                          }}
                        >
                          Hoàn tác
                        </button>
                      );

                      notifyOpen({ message: 'Xóa bài hát?', description: renderDesc(remaining), placement: 'topRight', key, duration: 0, btn: undoBtn });
                      intervalsRef.current[sid] = setInterval(() => {
                        remaining = Math.max(remaining - 1, 0);
                        notifyOpen({ message: 'Xóa bài hát?', description: renderDesc(remaining), placement: 'topRight', key, duration: 0, btn: undoBtn });
                        if (remaining === 0) {
                          clearInterval(intervalsRef.current[sid]);
                          delete intervalsRef.current[sid];
                        }
                      }, 1000);

                      timersRef.current[sid] = setTimeout(async () => {
                        delete timersRef.current[sid];
                        const iv = intervalsRef.current[sid];
                        if (iv) {
                          clearInterval(iv);
                          delete intervalsRef.current[sid];
                        }
                        notifyDestroy(key);
                        try {
                          const res = await removeTrackFromPlaylist(activePlaylist._id || activePlaylist.id, sid);
                          if (res && res.data) {
                            notifySuccess('Playlist', 'Đã xóa khỏi playlist');
                            const songs = res.data?.songs || [];
                            setPlaylistSongs(songs);
                            setPlaylists(prev => prev.map(p => {
                              const pid = p._id || p.id;
                              const aid = activePlaylist._id || activePlaylist.id;
                              if (String(pid) !== String(aid)) return p;
                              const count = Math.max((p.tracksCount || (p.tracks?.length || 0)) - 1, 0);
                              return { ...p, tracksCount: count };
                            }));
                            setPendingRemovals(prev => {
                              const next = new Set(prev);
                              next.delete(sid);
                              return next;
                            });
                          } else {
                            throw new Error(res?.message || 'Xóa bài hát thất bại');
                          }
                        } catch (err) {
                          notifyError('Playlist', err.message || 'Xóa bài hát thất bại');
                          setPendingRemovals(prev => {
                            const next = new Set(prev);
                            next.delete(sid);
                            return next;
                          });
                        }
                      }, 5000);
                    }}
                  />
                );
              })}
              {playlistSongs.length === 0 && (
                <div className="empty-state">Playlist này chưa có bài hát.</div>
              )}
            </div>
          )}
        </>
      )}

      {showCreate && (
        <PlaylistCreateModal
          onClose={() => setShowCreate(false)}
          onSubmit={async (payload, file) => {
            try {
              const res = await createUserPlaylist(payload);
              if(res && res.data) {
                let playlist = res.data.playlist || res.data;

                // If file selected, upload cover
                if (file && playlist?._id) {
                  const formData = new FormData();
                  formData.append('cover', file);
                  try {
                    const coverRes = await uploadPlaylistCover(playlist._id, formData);
                    if (coverRes && coverRes.data) {
                      playlist = coverRes.data;
                    }
                  } catch (e) {
                    notifyWarning('Playlist', 'Tạo playlist thành công nhưng upload ảnh bìa thất bại');
                  }
                }

                notifySuccess('Playlist', 'Tạo playlist thành công');
                setShowCreate(false);
                setPlaylists(prev => [playlist, ...prev]);
              } else {
                notifyError('Playlist', 'Tạo playlist thất bại');
              }
              
            } catch (err) {
              setError(err.message);
              notifyError('Playlist', err.message || 'Có lỗi xảy ra');
            }
          }}
        />
      )}
    </div>
  );
}