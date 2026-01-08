export default function GeneralPanel() {
  return (
    <div className="general-panel">
      <h3>General</h3>
      <p>Thông tin chung về thư viện, settings, cover, mô tả...</p>
      
      <div className="general-content">
        <div className="library-stats">
          <div className="stat-card">
            <span className="stat-number">247</span>
            <span className="stat-label">Total Songs</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">18</span>
            <span className="stat-label">Playlists</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">32</span>
            <span className="stat-label">Albums</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">45</span>
            <span className="stat-label">Artists</span>
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
    </div>
  );
}