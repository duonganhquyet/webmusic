import { useEffect, useState } from "react";
import { fetchFollowing } from "../../../../services/api";
import { useAuthContext } from "../../../../contexts/auth.context";
import { resolveAvatarUrl } from "../../../../utils/url";
import { Link } from "react-router-dom";

export default function FollowingPanel() {
  const { auth } = useAuthContext();
  const currentUserId = auth?.user?._id || auth?.user?.id;
  const [listFollowed, setListFollowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {


    const fetchDataFollow = async () => {
      try {
        if (!currentUserId) {
          setListFollowed([]);
          setLoading(false);
          return;
        }
        const res = await fetchFollowing(currentUserId);
        // API returns { following, count }
        const list = res?.following || res?.data?.following || [];
        setListFollowed(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataFollow();
  }, [currentUserId]);

  return (
    <div className="following-panel">
      <h3>Following</h3>
      {loading && <p>Loading following...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <>
          <p>Danh sách nghệ sĩ / người dùng bạn theo dõi. ({listFollowed.length} users)</p>
          <div className="following-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {listFollowed.map((f) => {
              const user = f.following || f; // safety: some responses may flatten
              const avatar = resolveAvatarUrl(user?.imgUrl) || "../../../../../public/default_avatar.png";
              const uid = user?._id || f?._id;
              return (
                <Link key={uid} to={`/user/${uid}`} style={{ textDecoration: 'none' }}>
                  <div className="following-card" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={avatar} alt={user?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.name || user?.username || 'Unknown User'}
                      </div>
                      <div style={{ color: '#9aa0a6', fontSize: 12 }}>
                        @{user?.username || 'user'}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {listFollowed.length === 0 && (
            <div className="empty-state">
              <p>Bạn chưa theo dõi nghệ sĩ nào. Khám phá và theo dõi nghệ sĩ yêu thích của bạn!</p>
                
            </div>
          )}
        </>
      )}
    </div>
  );
}