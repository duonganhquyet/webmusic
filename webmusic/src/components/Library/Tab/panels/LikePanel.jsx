import SongItem from "../../SongItem/SongItem";

export default function LikePanel() {
  // Mock data - sau này thay bằng API call
  const likedSongs = [
    {
      id: 1,
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCMCgvcat0EmKjZcRLa06Vf_vyWfppJPsIzw&s",
      title: "Bài hát demo",
      artist: "Ca sĩ demo"
    },
    {
      id: 2,
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBIQcznRvoMH0TrKCrrcok0_0hxF4xZNkEQA&s",
      title: "Somewhere Only We Know",
      artist: "Keane"
    },
    {
      id: 3,
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCMCgvcat0EmKjZcRLa06Vf_vyWfppJPsIzw&s",
      title: "Example Song 3",
      artist: "Artist Name"
    }
  ];

  return (
    <div className="like-panel">
      <h3>Liked Songs</h3>
      <p>Danh sách bài hát bạn đã like. ({likedSongs.length} bài hát)</p>
      
      <div className="song-list">
        {likedSongs.map(song => (
          <SongItem
            key={song.id}
            cover={song.cover}
            title={song.title}
            artist={song.artist}
            onPlay={() => console.log(`Playing: ${song.title}`)}
          />
        ))}
      </div>

      {likedSongs.length === 0 && (
        <div className="empty-state">
          <p>Bạn chưa like bài hát nào. Hãy khám phá và thêm những bài hát yêu thích của bạn!</p>
        </div>
      )}
    </div>
  );
}