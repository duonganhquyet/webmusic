import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { FaSearch } from "react-icons/fa";
import "./header.css";

const Header = () => {
    // State giả lập đăng nhập
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // State cho ô tìm kiếm
    const [searchTerm, setSearchTerm] = useState(""); 
    
    // Hook điều hướng
    const navigate = useNavigate(); 

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    const handleLoginTest = () => {
        setIsLoggedIn(true);
    };

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault(); 
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    // --- HÀM MỚI: Xử lý khi bấm Upload lúc CHƯA đăng nhập ---
    const handleUploadGuest = () => {
        alert("Vui lòng đăng nhập để thực hiện Upload!");
        // Nếu muốn tự động chuyển sang trang login sau khi thông báo, bỏ comment dòng dưới:
        // navigate("/login"); // hoặc gọi hàm mở popup login
    };

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

                {/* --- RIGHT SECTION --- */}
                <div className="header-right">
                    {isLoggedIn ? (
                        // === TRƯỜNG HỢP: ĐÃ ĐĂNG NHẬP ===
                        <>
                            {/* Dùng Link để chuyển trang bình thường */}
                            <Link to="/upload" className="upload-link">Upload</Link>
                            
                            <div className="user-avatar">
                                <span>U</span>
                            </div>

                            <button className="btn btn-logout" onClick={handleLogout}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        // === TRƯỜNG HỢP: CHƯA ĐĂNG NHẬP ===
                        <>
                            {/* Thay Link bằng thẻ span và thêm sự kiện onClick báo lỗi */}
                            <span 
                                className="upload-link" 
                                onClick={handleUploadGuest} 
                                style={{ cursor: "pointer" }} // Thêm con trỏ tay để giống nút bấm
                            >
                                Upload
                            </span>
                            
                            <button className="btn btn-login" onClick={handleLoginTest}>Sign in</button>
                            <Link to="/signup" className="btn btn-signup">Create account</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;