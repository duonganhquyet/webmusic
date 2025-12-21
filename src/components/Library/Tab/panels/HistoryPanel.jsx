import SongItem from "../../SongItem/SongItem";

export default function HistoryPanel() {
  // Mock data - sau này thay bằng API call
  const history = [
    {
      id: 1,
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBIQcznRvoMH0TrKCrrcok0_0hxF4xZNkEQA&s",
      title: "Somewhere Only We Know",
      artist: "Keane",
      playedAt: "2 hours ago"
    },
    {
      id: 2,
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCMCgvcat0EmKjZcRLa06Vf_vyWfppJPsIzw&s",
      title: "Blinding Lights",
      artist: "The Weeknd",
      playedAt: "5 hours ago"
    },
    {
      id: 3,
      cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
      title: "Shape of You",
      artist: "Ed Sheeran",
      playedAt: "Yesterday"
    },
    {
      id: 4,
      cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
      title: "Levitating",
      artist: "Dua Lipa",
      playedAt: "Yesterday"
    },
    {
      id: 5,
      cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
      title: "Bohemian Rhapsody",
      artist: "Queen",
      playedAt: "2 days ago"
    }
  ];

  const handleClearHistory = () => {
    if (confirm("Bạn có chắc muốn xóa toàn bộ lịch sử nghe nhạc?")) {
      console.log("Clear history");
      alert("Xóa lịch sử thành công!")
      // Logic xóa lịch sử
    }
  };

  return (
    <div className="history-panel">
      <div className="panel-header">
        <div>
          <h3>History</h3>
          <p>Lịch sử nghe nhạc gần đây. ({history.length} bài hát)</p>
        </div>
        <button className="clear-history-btn" onClick={handleClearHistory}>
          Clear History
        </button>
      </div>

      <div className="song-list">
        {history.map(song => (
          <div key={song.id} className="history-item">
            <SongItem
              cover={song.cover}
              title={song.title}
              artist={song.artist}
              onPlay={() => console.log(`Playing: ${song.title}`)}
            />
            <span className="played-time">{song.playedAt}</span>
          </div>
        ))}
      </div>

      {history.length === 0 && (
        <div className="empty-state">
          <p>Lịch sử nghe nhạc trống. Bắt đầu nghe nhạc để xem lịch sử tại đây!</p>
        </div>
      )}
    </div>
  );
}