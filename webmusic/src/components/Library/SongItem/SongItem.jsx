import { useState } from "react";
import "./SongItem.css";

export default function SongItem({
  cover,
  title,
  artist,
  liked = false,
  onPlay,
  onLike,
  onMore,
}) {
  const [isLiked, setIsLiked] = useState(liked);

  function toggleLike(e) {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike && onLike(!isLiked);
  }

  return (
    <div className="song-item" onClick={onPlay}>
      <div className="song-cover-wrapper">
        <img src={cover} alt={title} className="song-cover" />

        <button className="play-btn" onClick={onPlay}>
          ▶
        </button>
      </div>

      <div className="song-info">
        <p className="song-title">{title}</p>
        <p className="song-artist">{artist}</p>
      </div>

      <div className="song-actions">
        <button className="like-btn" onClick={toggleLike}>
          {isLiked ? "❤️" : "🤍"}
        </button>

        <button
          className="more-btn"
          onClick={(e) => {
            e.stopPropagation();
            onMore && onMore();
          }}
        >
          ⋯
        </button>
      </div>
    </div>
  );
}
