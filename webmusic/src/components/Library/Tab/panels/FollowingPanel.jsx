export default function FollowingPanel() {
  const following = [
    {
      id: 1,
      name: "Taylor Swift",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      followers: "89.5M",
      isVerified: true
    },
    {
      id: 2,
      name: "Ed Sheeran",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      followers: "67.2M",
      isVerified: true
    },
    {
      id: 3,
      name: "Billie Eilish",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      followers: "95.3M",
      isVerified: true
    },
    {
      id: 4,
      name: "The Weeknd",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      followers: "78.9M",
      isVerified: true
    },
    {
      id: 5,
      name: "Indie Artist",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
      followers: "125K",
      isVerified: false
    }
  ];

  return (
    <div className="following-panel">
      <h3>Following</h3>
      <p>Danh sách nghệ sĩ / người dùng bạn theo dõi. ({following.length} artists)</p>

      <div className="following-list">
        {following.map(artist => (
          <div key={artist.id} className="artist-card">
            <div className="artist-avatar">
              <img src={artist.avatar} alt={artist.name} />
            </div>
            <div className="artist-info">
              <h4>
                {artist.name}
                {artist.isVerified && (
                  <span className="verified-badge">✓</span>
                )}
              </h4>
              <p>{artist.followers} followers</p>
            </div>
            <button className="following-btn active">Following</button>
          </div>
        ))}
      </div>

      {following.length === 0 && (
        <div className="empty-state">
          <p>Bạn chưa theo dõi nghệ sĩ nào. Khám phá và theo dõi nghệ sĩ yêu thích của bạn!</p>
        </div>
      )}
    </div>
  );
}