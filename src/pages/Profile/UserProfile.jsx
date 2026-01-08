import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ManageUploadedTrack from "./ManageUploadedTrack";
import FollowButton from "./FollowButton";
import "./UserProfile.css";
import { useAuthContext } from "../../contexts/auth.context";
import { fetchSongsByUser } from "../../services/api";
import axios from "../../services/axios.customize";

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

  const { auth, setAuth } = useAuthContext();
  const currentUser = auth?.user;
  const isOwner = currentUser && String(currentUser._id) === String(id);

  const titleRefs = useRef([]);
  const [overflowFlags, setOverflowFlags] = useState([]);

  useEffect(() => {
    const flags = tracks.map((_, index) => {
      const el = titleRefs.current[index];
      if (!el) return false;
      return el.scrollWidth > el.parentElement.offsetWidth;
    });
    setOverflowFlags(flags);
  }, [tracks]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let profileUser = null;

        if (isOwner) {
          profileUser = currentUser;
        } else {
          try {
            const res = await axios.get(`/api/user/public/${id}`, { skipAuth: true });
            profileUser = res?.user || res?.data?.user || null;
          } catch (err) {
            console.warn("Không thể fetch public user:", err);
            profileUser = null;
          }
        }

        if (!profileUser) {
          setUser(null);
          return;
        }
        setUser(profileUser);

        // ================= FETCH FOLLOWERS/FOLLOWING =================
        let followersCount = 0;
        let followingCount = 0;

        if (currentUser) {
          // Logged in → dùng route private
          try {
            const [followersList, followingObj] = await Promise.all([
              axios.get(`/api/follow/followers/${profileUser._id}`),
              axios.get(`/api/follow/following/${profileUser._id}`),
            ]);
            followersCount = Array.isArray(followersList) ? followersList.length : 0;
            followingCount = followingObj?.count || 0;
          } catch {}
        } else {
          // Not logged in → dùng route public
          try {
            const [followersRes, followingRes] = await Promise.all([
              axios.get(`/api/follow/public/followers/${profileUser._id}`, { skipAuth: true }),
              axios.get(`/api/follow/public/following/${profileUser._id}`, { skipAuth: true }),
            ]);
            followersCount = followersRes?.followers || 0;
            followingCount = followingRes?.following || 0;
          } catch {}
        }

        setStats((prev) => ({
          ...prev,
          followers: followersCount,
          following: followingCount,
        }));

        // ================= FETCH TRACKS =================
        const userTracks = await fetchSongsByUser(profileUser._id).catch(() => []);
        setTracks(userTracks);
        setStats((prev) => ({ ...prev, tracks: userTracks.length }));
      } catch (err) {
        console.error("Error fetching profile:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, isOwner, currentUser]);

  const totalPages = Math.ceil(tracks.length / ITEMS_PER_PAGE);
  const paginatedTracks = tracks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

      if (res?.user?.imgUrl || res?.data?.user?.imgUrl) {
        const newImg = res.user?.imgUrl || res.data.user.imgUrl;
        setUser((prev) => ({ ...prev, imgUrl: newImg }));
        setAuth((prev) => ({
          ...prev,
          user: { ...prev.user, imgUrl: newImg },
        }));
      }
    } catch {
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
                  ? `${import.meta.env.VITE_BACKEND_URL}/images/${user.imgUrl}`
                  : "/default_avatar.png"
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

            {!isOwner && (
              <FollowButton
                targetUserId={id}
                onStatsChange={(newFollowersCount) =>
                  setStats((prev) => ({
                    ...prev,
                    followers: newFollowersCount ?? prev.followers,
                  }))
                }
                requireLoginAlert={true}
              />
            )}
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
                <button className="upload-btn" onClick={() => navigate("/upload")}>
                  Upload now
                </button>
              )}
            </>
          ) : (
            <>
              <div className="results-grid">
                {paginatedTracks.map((track, index) => (
                  <div key={track._id} className="track-card">
                    <div className="track-img-wrapper">
                      <img
                        src={
                          track.imgUrl
                            ? track.imgUrl.startsWith("http") || track.imgUrl.startsWith("/images")
                              ? `${import.meta.env.VITE_BACKEND_URL}${track.imgUrl}`
                              : `${import.meta.env.VITE_BACKEND_URL}/images/${track.imgUrl}`
                            : "/default-cover.png"
                        }
                        className="track-cover"
                      />
                      <Link to={`/track/${track._id}`} className="play-overlay">
                        ▶
                      </Link>
                    </div>

                    <div className="track-info">
                      <div className="track-title-wrapper">
                        <div
                          className={`track-title ${overflowFlags[index] ? "marquee" : ""}`}
                          ref={(el) => (titleRefs.current[index] = el)}
                        >
                          {track.title}
                        </div>
                      </div>
                      <div className="track-artist-line">{track.description}</div>
                    </div>

                    {isOwner && (
                      <ManageUploadedTrack
                        track={track}
                        onUpdate={(updatedTrack) =>
                          setTracks((prev) =>
                            prev.map((t) => (t._id === updatedTrack._id ? updatedTrack : t))
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

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`page-btn ${page === currentPage ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

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
