import './Navbar.css'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">WebMusic 🎵</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/feed">Feed</Link></li>
        <li><Link to="/library">Library</Link></li>
      </ul>
      <div className="navbar-buttons">
        <Link to="/login" className="navbar-btn login-btn">Login</Link>
        <Link to="/signup" className="navbar-btn signup-btn">Sign Up</Link>
      </div>
    </nav>
  )
}

export default Navbar
