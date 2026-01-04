import { Outlet, useLocation } from "react-router-dom"; 
import Header from "./components/layout/header";
import AppFooter from "./components/footer/app.footer";
import NotificationInit from './components/NotificationInit'; // Import component đã tạo
import "./assets/styles/global.css";

const App = () => {
  const location = useLocation(); 
  
  // Kiểm tra xem đường dẫn có bắt đầu bằng "/admin" không
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* 1. Đặt NotificationInit ở đây để nó luôn hoạt động (cả Admin lẫn User) */}
      <NotificationInit />

      {/* 2. Các thành phần giao diện khác */}
      {!isAdminRoute && <Header />}

      <Outlet />

      {!isAdminRoute && <AppFooter/>}
    </>
  )
}

export default App;