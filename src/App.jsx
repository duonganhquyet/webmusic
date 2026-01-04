<<<<<<< HEAD
import { Outlet, useLocation } from "react-router-dom";
=======
import { Outlet, useLocation } from "react-router-dom"; // 1. Thêm useLocation
>>>>>>> 37ade6cf7e840b72a3fd73b2e2382e9b38dc877a
import Header from "./components/layout/header";
import AppFooter from "./components/footer/app.footer";
import "./assets/styles/global.css";

const App = () => {
<<<<<<< HEAD
  const location = useLocation();
  const { pathname } = location;
  const hideLayout = pathname === "/login" || pathname === "/signup";
  return (
    <>
          {!hideLayout && <Header />}
          <Outlet />
          {!hideLayout && <AppFooter/>}
=======
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
>>>>>>> 37ade6cf7e840b72a3fd73b2e2382e9b38dc877a
    </>
  )
}

export default App;