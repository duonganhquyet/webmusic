import { Outlet, useLocation } from "react-router-dom"; // 1. Thêm useLocation
import Header from "./components/layout/header";
import AppFooter from "./components/footer/app.footer";
import "./assets/styles/global.css";

const App = () => {
  const location = useLocation(); // 2. Lấy thông tin URL hiện tại

  // 3. Kiểm tra xem đường dẫn có bắt đầu bằng "/admin" không
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* 4. Chỉ hiện Header nếu KHÔNG PHẢI là trang Admin */}
      {!isAdminRoute && <Header />}

      <Outlet />

      {/* 5. Chỉ hiện Footer nếu KHÔNG PHẢI là trang Admin */}
      {!isAdminRoute && <AppFooter/>}
    </>
  )
}

export default App;