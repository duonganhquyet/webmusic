import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../services/axios.customize";
import ManageUploadedTrack from "./ManageUploadedTrack";
import "./UserProfile.css";
import { useAuthContext } from "../../contexts/auth.context";

const ITEMS_PER_PAGE = 5;

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, tracks: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const {auth,setAuth} = useAuthContext();

  const currentUser = auth?.user;
  const isOwner = currentUser?._id === id;

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isOwner) {
            setUser(currentUser);
        }
        else {
          const res = await axios.get(`/api/user/public/${id}`);
          if(res && res.data){
              setUser(res?.data?.user);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchTracks = async () => {
      try {
        const res = await axios.get(`/api/user/${id}/songs`);
        if(res && res.data){
          setTracks(res?.data?.songs || []);
          setStats((prev) => ({ ...prev, tracks: res?.data?.songs?.length || 0 }));

        }
      } catch (err) {
        console.error(err);
      }
    };

    Promise.all([fetchProfile(), fetchTracks()]).finally(() => setLoading(false));
  }, [id, isOwner, currentUser]);

  /* ===== PAGINATION ===== */
  const totalPages = Math.ceil(tracks.length / ITEMS_PER_PAGE);
  const paginatedTracks = tracks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= AVATAR ================= */
  const handleAvatarClick = () => {
    if (isOwner) fileInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const res = await axios.put(`/api/user/${id}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.user?.imgUrl) {
        setUser((prev) => ({ ...prev, imgUrl: res.user.imgUrl }));
        setAuth((prev) => ({
          user: {
            ...prev.user,
            imgUrl: res.user.imgUrl,
          },
        }) );
      }
    } catch (err) {
      alert("Upload avatar failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="profile-page">
        <p style={{ padding: 40 }}>Loading...</p>
      </div>
    );

  if (!user)
    return (
      <div className="profile-page">
        <p style={{ padding: 40 }}>User not found</p>
      </div>
    );

  return (
    <div className="profile-page">
      {/* ===== BANNER ===== */}
      <div className="profile-banner">
        <img src="/default_banner.jpg" className="banner-img" />
        <div className="profile-info">
          <div
            className="avatar-wrapper"
            onClick={handleAvatarClick}
            title={isOwner ? "Click to change avatar" : ""}
          >
            <img
              src={
                user.imgUrl
                  ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.imgUrl}`
                  : "../../../public/default_avatar.png"
              }
              className="profile-avatar"
            />
            {uploading && <div className="avatar-loading">Uploading...</div>}
            {isOwner && <div className="edit-avatar-icon">✎</div>}
          </div>

          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*"
            onChange={handleAvatarChange}
          />

          <div className="profile-text">
            <h1>{user.name}</h1>
            <span className="username">@{user.username}</span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className="active">UPLOADED TRACKS</button>
      </div>

      <div className="profile-main">
        <div className="profile-content">
          {tracks.length === 0 ? (
            <>
              <p className="empty-text">No uploaded tracks yet</p>
              {isOwner && (
                <button
                  className="upload-btn"
                  onClick={() => navigate("/upload")}
                >
                  Upload now
                </button>
              )}
            </>
          ) : (
            <>
              <div className="results-grid">
                {paginatedTracks.map((track) => (
                  <div key={track._id} className="track-card">
                    <div className="track-img-wrapper">
                      <img
                        src={
                          track.imgUrl
                            ? track.imgUrl.startsWith("http") ||
                              track.imgUrl.startsWith("/uploads")
                              ? `${import.meta.env.VITE_BACKEND_URL}${track.imgUrl}`
                              : `${import.meta.env.VITE_BACKEND_URL}/uploads/${track.imgUrl}`
                            : "/default-cover.png"
                        }
                        className="track-cover"
                      />
                      <Link
                        to={`/track/${track._id}`}
                        className="play-overlay"
                      >
                        ▶
                      </Link>
                    </div>
                    <div className="track-info">
                      <div className="track-title">{track.title}</div>
                      <div className="track-artist-line">{track.description}</div>
                    </div>

                    {isOwner && (
                      <ManageUploadedTrack
                        track={track}
                        onUpdate={(updatedTrack) =>
                          setTracks((prev) =>
                            prev.map((t) =>
                              t._id === updatedTrack._id ? updatedTrack : t
                            )
                          )
                        }
                        onDelete={(deletedId) => {
                          setTracks((prev) => prev.filter((t) => t._id !== deletedId));
                          setStats((prev) => ({ ...prev, tracks: prev.tracks - 1 }));
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* ===== PAGINATION ===== */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={`page-btn ${
                          page === currentPage ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="profile-sidebar">
          <div className="stat-box">
            <span>Followers</span>
            <strong>{stats.followers}</strong>
          </div>
          <div className="stat-box">
            <span>Following</span>
            <strong>{stats.following}</strong>
          </div>
          <div className="stat-box">
            <span>Tracks</span>
            <strong>{stats.tracks}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
