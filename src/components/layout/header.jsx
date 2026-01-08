import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { FaSearch } from "react-icons/fa";
import "./header.css"; // Nhớ import file CSS vừa tạo
import { useAuthContext } from "../../contexts/auth.context";

// ✅ 1. Import hệ thống thông báo
import { notifySuccess, notifyWarning, notifyError } from "../../utils/notification";

const Header = () => {
    const { auth, setAuth } = useAuthContext();
    const isLoggedIn = auth.user && auth.user._id ? true : false;
    
    // State cho ô tìm kiếm
    const [searchTerm, setSearchTerm] = useState(""); 

    // --- STATE MỚI: Gợi ý tìm kiếm (Dropdown) ---
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    
    const navigate = useNavigate(); 
    const searchRef = useRef(null);
    const API_BASE = "http://localhost:8080"; // Định nghĩa base URL để dễ quản lý

    // --- 1. XỬ LÝ LIVE SEARCH ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length > 0) { 
                try {
                    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(searchTerm)}`);
                    const data = await res.json();
                    const results = data.data || data.songs || (Array.isArray(data) ? data : []);
                    setSuggestions(results.slice(0, 5));
                    setShowDropdown(true);
                } catch (error) {
                    console.error("Lỗi tìm kiếm:", error);
                }
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectSuggestion = (songId) => {
        navigate(`/track/${songId}`);
        setShowDropdown(false);
        setSearchTerm(""); 
    };

    const handleSearch = (e) => {
        e.preventDefault(); 
        setShowDropdown(false);
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleUploadGuest = () => {
        notifyWarning("Yêu cầu quyền truy cập", "Vui lòng đăng nhập để thực hiện Upload!");
    };
    
    const handleLogout = () => {
        setAuth({ user: null, token: null });
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/");
        notifySuccess("Đăng xuất thành công", "Hẹn gặp lại bạn!");
    }

    // Hàm tiện ích lấy ảnh
    const getImageUrl = (path) => {
        if (!path) return "/default_avatar.png";
        if (path.startsWith("http")) return path;
        // Xử lý dấu gạch chéo
        return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
    }

    const getAvatarUrl = (imgUrl) => {
         if (!imgUrl || imgUrl === "default_avatar.png") return "/default_avatar.png";
         return `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${imgUrl}`;
    }

    return (
        <header className="sc-header">
            <div className="header-inner">
                {/* --- LEFT SECTION --- */}
                <div className="header-left">
                    <Link to="/" className="logo">WEBNHAC</Link>
                    <ul className="nav-menu">
                        <li><Link to="/" className="nav-item">Home</Link></li>
                        <li><Link to="/feed" className="nav-item">Feed</Link></li>
                        <li><Link to="/library" className="nav-item">Library</Link></li>
                    </ul>
                </div>

                {/* --- CENTER SECTION (SEARCH) --- */}
                <div className="header-center" ref={searchRef}>
                    <form className="search-form" onSubmit={handleSearch}>
                        <input 
                            type="text" 
                            placeholder="Search for artists, tracks..." 
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            onFocus={() => { if(suggestions.length > 0) setShowDropdown(true) }}
                        />
                        {/* Icon tìm kiếm nằm trong form, được CSS absolute sang phải */}
                        <button type="submit" className="search-btn">
                            <FaSearch />
                        </button>
                    </form>

                    {/* DROPDOWN KẾT QUẢ */}
                    {showDropdown && suggestions.length > 0 && (
                        <div className="search-dropdown">
                            {suggestions.map((song) => (
                                <div 
                                    key={song._id} 
                                    className="search-dropdown-item"
                                    onClick={() => handleSelectSuggestion(song._id)}
                                >
                                    <img 
                                        src={getImageUrl(song.imgUrl)} 
                                        alt="" 
                                        className="search-thumb"
                                        onError={(e) => {e.target.src = "/default-cover.png"}}
                                    />
                                    <div className="search-info">
                                        <div className="search-title">{song.title}</div>
                                        <div className="search-artist">{song.description || song.uploader?.username}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- RIGHT SECTION --- */}
                <div className="header-right">
                    {isLoggedIn ? (
                        <>
                            <Link to="/upload" className="upload-link">Upload</Link>
                            
                            <Link to={`/user/${auth.user._id}`} className="user-avatar">
                                <img 
                                    src={getAvatarUrl(auth.user.imgUrl)} 
                                    alt="User Avatar" 
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => {e.target.src = "/default_avatar.png"}}
                                />
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
                            
                            <Link to={"/login"} className="btn btn-login">Sign in</Link>
                            <Link to="/signup" className="btn btn-signup">Create account</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;