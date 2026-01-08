import './Login.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { loginUser } from '../../services/api'
import { notifySuccess } from '../../utils/notification'
import { useAuthContext } from '../../contexts/auth.context'

// ✅ 1. Import hàm thông báo
import { notifySuccess, notifyError } from '../../utils/notification' 

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { setAuth } = useAuthContext();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const res = await loginUser(username, password);
      
      if(res && res.data){
        // 1. Lưu token
        localStorage.setItem("accessToken", res.data.accessToken);

        // 2. Cập nhật Context
        setAuth({
          user: res.data.user
        })

        // ✅ 3. Thay alert bằng notifySuccess
        // Lấy tên hiển thị: ưu tiên name, nếu không có thì lấy username
        const displayName = res.data.user.name || res.data.user.username || "User";
        notifySuccess("Đăng nhập thành công!", `Chào mừng ${displayName} quay trở lại.`);

        // === Kiểm tra quyền Admin ===
        if (res.data.user.role === "admin") {
            navigate("/admin"); 
        } else {
            navigate("/");      
        }
        // =======================================

      } else {
        // ✅ 4. Thông báo lỗi khi API không trả về data hợp lệ
        const msg = "Đăng nhập thất bại. Vui lòng thử lại.";
        setError(msg); // Vẫn giữ text đỏ dưới form (tuỳ chọn)
        notifyError("Đăng nhập thất bại", msg);
      }

    } catch (err) {
      console.error(err); 
      // ✅ 5. Thông báo lỗi hệ thống (sai pass, server lỗi, v.v.)
      const errorMsg = err.message || "Có lỗi xảy ra trong quá trình đăng nhập.";
      setError(errorMsg);
      notifyError("Lỗi", errorMsg);
    }
  }

  return (
    <div className="login-container">
      <div className="back-home">
        <Link to="/">&larr; Back to Home</Link>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        {/* Vẫn giữ error text nếu bạn muốn hiển thị cả 2 nơi, hoặc có thể bỏ dòng này */}
        {error && <p style={{ color: "red", textAlign: 'center', marginBottom: '10px' }}>{error}</p>}
        
        <div className="form-group-login">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group-login">
          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              placeholder="Enter your password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              className="toggle-password" 
              onClick={togglePasswordVisibility}
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="login-btn">Login</button>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </div>
      </form>
    </div>
  )
}

export default Login