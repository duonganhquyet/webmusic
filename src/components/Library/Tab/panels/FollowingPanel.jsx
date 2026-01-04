import { useEffect, useState } from "react";
import { fetchFollowingArtists } from "../../../../services/api";

export default function FollowingPanel() {
  const [listFollowed, setListFollowed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {


    const fetchDataFollow = async () => {
      try {
        const res = await fetchFollowingArtists();
        if(res && res.data){
          setListFollowed(res.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataFollow();
  }, []);

  return (
    <div className="following-panel">
      <h3>Following</h3>
      {loading && <p>Loading following...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <>
          <p>Danh sách nghệ sĩ / người dùng bạn theo dõi. ({listFollowed?.count} users)</p>
          <div className="following-list">
            {/* When follow model exists, render cards here */}
          </div>
          {listFollowed?.count === 0 && (
            <div className="empty-state">
              <p>Bạn chưa theo dõi nghệ sĩ nào. Khám phá và theo dõi nghệ sĩ yêu thích của bạn!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}