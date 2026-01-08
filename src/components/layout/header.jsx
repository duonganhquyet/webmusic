import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { FaSearch } from "react-icons/fa";
import "./header.css";
import { useAuthContext } from "../../contexts/auth.context";

const Header = () => {

    const { auth, setAuth } = useAuthContext();
    
    const isLoggedIn = auth.user && auth.user._id ? true : false;
    console.log("check auth", auth);
    
    // State cho ô tìm kiếm
    const [searchTerm, setSearchTerm] = useState(""); 

    // --- STATE MỚI: Gợi ý tìm kiếm (Dropdown) ---
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Hook điều hướng & Ref để xử lý click ra ngoài
    const navigate = useNavigate(); 
    const searchRef = useRef(null);

    // --- 1. XỬ LÝ LIVE SEARCH (Tự động tìm khi gõ) ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length > 0) { 
                try {
                    const res = await fetch(`http://localhost:8080/api/search?q=${encodeURIComponent(searchTerm)}`);
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
        alert("Vui lòng đăng nhập để thực hiện Upload!");
    };
    
    const handleLogout = () => {
        // ✅ Reset hoàn toàn auth context và localStorage
        setAuth({ user: null, token: null });
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/");
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
                <div className="header-center" ref={searchRef} style={{position: 'relative', zIndex: 1000}}>
                    <form className="search-form" onSubmit={handleSearch}>
                        <input 
                            type="text" 
                            placeholder="Search" 
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            onFocus={() => { if(suggestions.length > 0) setShowDropdown(true) }}
                        />
                        <button type="submit" className="search-btn">
                            <FaSearch/>
                        </button>
                    </form>

                    {showDropdown && suggestions.length > 0 && (
                        <div className="search-dropdown">
                            {suggestions.map((song) => (
                                <div 
                                    key={song._id} 
                                    className="search-dropdown-item"
                                    onClick={() => handleSelectSuggestion(song._id)}
                                >
                                    <img 
                                        src={song.imgUrl ? (song.imgUrl.startsWith("http") ? song.imgUrl : `http://localhost:8080${song.imgUrl.startsWith("/") ? "" : "/"}${song.imgUrl}`) : "/default-cover.png"} 
                                        alt="" 
                                        className="search-thumb"
                                    />
                                    <div className="search-info">
                                        <div className="search-title">{song.title}</div>
                                        <div className="search-artist">{song.description}</div>
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
                                    src={auth.user.imgUrl && auth.user.imgUrl !== "default_avatar.png" 
                                        ? `${import.meta.env.VITE_BACKEND_URL}/images/${auth.user.imgUrl}` 
                                        : "/default_avatar.png"} 
                                    alt="Ảnh avatar" 
                                    style={{ objectFit: "cover", width:"100%" }}
                                />
                            </Link>

                            <button className="btn btn-logout" onClick={handleLogout}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <span 
                                className="upload-link" 
                                onClick={handleUploadGuest} 
                                style={{ cursor: "pointer" }} 
                            >
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
