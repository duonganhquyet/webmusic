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
    try {
      const res = await axios.post("/api/follow", {
        followingId: targetUserId,
      });

      const { isFollowing: newStatus, targetUserFollowersCount } =
        res?.data || {};

      if (typeof newStatus === "boolean") {
        setIsFollowing(newStatus);

        // ✅ chỉ update followers của profile
        onStatsChange?.(targetUserFollowersCount);
      }
    } catch (err) {
      console.error("toggle follow error:", err);
    }
  };

  if (!currentUser || isOwner || loading) return null;

  return (
    <button
      className={`follow-btn ${isFollowing ? "following" : ""}`}
      onClick={handleToggleFollow}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
