import { createBrowserRouter } from 'react-router-dom';
import App from '../App.jsx';
import HomePage from '../pages/home.page.jsx';
import PageFeed from '../pages/feed.page.jsx';
import PageFeed2 from '../pages/feed.page.2.jsx';
import TrackPage from '../pages/track.jsx';
import Library from '../pages/Library/Library.jsx';
import Login from '../pages/Login/Login.jsx';
import Signup from '../pages/Signup/Signup.jsx';
import SearchPage from '../pages/SearchPage';
import UploadPage from '../pages/UploadPage';
import UserProfile from '../pages/Profile/UserProfile.jsx';

// Import trang Admin (Đảm bảo đường dẫn đúng với nơi bạn lưu file)
import AdminPage from '../pages/AdminPage.jsx'; 

const router = createBrowserRouter([
  // --- NHÓM 1: GIAO DIỆN NGƯỜI DÙNG (Có Header, Player, Footer) ---
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "feed", element: <PageFeed /> },
      { path: "feed1", element: <PageFeed2 /> },
      { path: "track/:id", element: <TrackPage /> },
      { path: "library", element: <Library /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "search", element: <SearchPage /> },
      { path: "upload", element: <UploadPage /> },
      { path: "user/:id", element: <UserProfile /> },
    ],
  },

  // --- NHÓM 2: GIAO DIỆN ADMIN (Đứng độc lập, trắng trơn) ---
  {
    path: "/admin",
    element: <AdminPage />,
  },
]);

export default router;