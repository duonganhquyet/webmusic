import { useEffect, useState } from "react";
import { fetchDataGeneralPanel } from "../../../../services/api";
import { useAuthContext } from "../../../../contexts/auth.context";

export default function GeneralPanel(props) {
  const {changed} = props;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Assume data might be outdated when 'changed' flips; show loading
    setLoading(true);
    const fetchStats = async () => {
      try {
        // const res = await fetchDataGeneralPanel(auth?.user?._id);
        const res = await fetchDataGeneralPanel();
        if(res && res.data){
         setStats(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [changed]);

  return (
    <div className="general-panel">
      <h3>General</h3>
      <p>Thông tin chung về thư viện, settings, cover, mô tả...</p>

      {loading && <p>Loading stats...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && stats && (
        <div className="general-content">
          <div className="library-stats">
            <div className="stat-card">
              <span className="stat-number">{stats.uploadedCount}</span>
              <span className="stat-label">Uploaded Songs</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.favoriteCount}</span>
              <span className="stat-label">Liked Songs</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.playlistCount}</span>
              <span className="stat-label">Playlists</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.daysSinceCreated}</span>
              <span className="stat-label">Days Active</span>
            </div>
          </div>

          <div className="library-settings">
            <h4>Library Settings</h4>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                <span>Tự động tải về các bài hát yêu thích</span>
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" />
                <span>Hiện toàn bộ lời bài hát</span>
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                <span>Tự động phát bài hát tiếp theo</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}