import './Signup.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className="signup-container">
      <div className="back-home">
        <Link to="/">&larr; Back to Home</Link>
      </div>

      <form className="signup-form">
        <h1>Sign Up</h1>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" placeholder="Enter your username" required />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" required />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              placeholder="Enter your password" 
              required 
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

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <div className="password-input-wrapper">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              id="confirm-password" 
              placeholder="Confirm your password" 
              required 
            />
            <button 
              type="button" 
              className="toggle-password" 
              onClick={toggleConfirmPasswordVisibility}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? (
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

        <button type="submit" className="signup-btn">Sign Up</button>

        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </form>
    </div>
  )
}

export default Signup