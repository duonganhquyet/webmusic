import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./header.css";

const Header = () => {
  // ✅ KIỂM TRA ĐÚNG TOKEN
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // 🔹 STATE USER – đồng bộ avatar
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const userId = user?._id;

  // 🔹 LẮNG NGHE AVATAR UPDATE TỪ USERPROFILE
  useEffect(() => {
    const handleAvatarUpdate = (e) => {
      setUser(e.detail);
    };
    window.addEventListener("userAvatarUpdated", handleAvatarUpdate);

    return () => {
      window.removeEventListener("userAvatarUpdated", handleAvatarUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleUploadGuest = () => {
    alert("Vui lòng đăng nhập để thực hiện Upload!");
    navigate("/login");
  };

  return (
    <header className="sc-header">
      <div className="header-inner">
        {/* LEFT */}
        <div className="header-left">
          <Link to="/" className="logo">WEBNHAC</Link>
          <ul className="nav-menu">
            <li><Link to="/" className="nav-item">Home</Link></li>
            <li><Link to="/feed" className="nav-item">Feed</Link></li>
            <li><Link to="/library" className="nav-item">Library</Link></li>
          </ul>
        </div>

        {/* CENTER */}
        <div className="header-center">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <FaSearch />
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="header-right">
          {isLoggedIn ? (
            <>
              <Link to="/upload" className="upload-link">Upload</Link>

              {/* AVATAR → PROFILE */}
              <Link to={`/user/${userId}`} className="user-avatar">
                {user?.imgUrl ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/uploads/avatars/${user.imgUrl}`}
                    alt="avatar"
                    className="header-avatar-img"
                  />
                ) : (
                  <span>U</span>
                )}
              </Link>

              <button className="btn btn-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <span className="upload-link" onClick={handleUploadGuest}>
                Upload
              </span>
              <Link to="/login" className="btn btn-login">Sign in</Link>
              <Link to="/signup" className="btn btn-signup">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
