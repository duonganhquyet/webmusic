<<<<<<< HEAD
import { Outlet, useLocation } from "react-router-dom"; // 1. Thêm useLocation
=======
import { Outlet, useLocation } from "react-router-dom";
>>>>>>> 872cc1932cd6893594de66e181cc5264b61c8988
import Header from "./components/layout/header";
import AppFooter from "./components/footer/app.footer";
import "./assets/styles/global.css";

const App = () => {
<<<<<<< HEAD
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
=======
  const location = useLocation();
  const { pathname } = location;
  const hideLayout = pathname === "/login" || pathname === "/signup";
  return (
    <>
          {!hideLayout && <Header />}
          <Outlet />
          {!hideLayout && <AppFooter/>}
>>>>>>> 872cc1932cd6893594de66e181cc5264b61c8988
    </>
  )
}

export default App;