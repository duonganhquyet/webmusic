import { useEffect, useState } from "react";
import axios from "../../services/axios.customize";
import { useAuthContext } from "../../contexts/auth.context";

const FollowButton = ({ targetUserId, onStatsChange }) => {
  const { auth } = useAuthContext();
  const currentUser = auth?.user;

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwner = String(currentUser?._id) === String(targetUserId);

  // ================= CHECK STATUS =================
  useEffect(() => {
    if (!currentUser || isOwner) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/follow/status/${targetUserId}`);
        setIsFollowing(res?.isFollowing || false);
      } catch (err) {
        console.error("check follow error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [targetUserId, currentUser, isOwner]);

  // ================= TOGGLE =================
  const handleToggleFollow = async () => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để sử dụng tính năng này!");
      return;
    }

    try {
      const res = await axios.post("/api/follow", { followingId: targetUserId });

      // Lấy trạng thái mới và followers count từ backend
      const { isFollowing: newStatus, targetUserFollowersCount } = res?.data || {};

      if (typeof newStatus === "boolean") {
        setIsFollowing(newStatus);

        // Nếu backend trả followers count → dùng, nếu không → tăng giảm thủ công
        if (typeof targetUserFollowersCount === "number") {
          onStatsChange?.(targetUserFollowersCount);
        } else {
          onStatsChange?.((prev) => prev + (newStatus ? 1 : -1));
        }
      }
    } catch (err) {
      console.error("toggle follow error:", err);
    }
  };

  // Không hiển thị cho owner hoặc đang loading
  if (isOwner || loading) return null;

  return (
    <button
      className={`follow-btn ${isFollowing ? "following" : ""}`}
      onClick={handleToggleFollow}
    >
      {currentUser ? (isFollowing ? "Following" : "Follow") : "Follow"}
    </button>
  );
};

export default FollowButton;
