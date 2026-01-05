import { Outlet, useLocation } from "react-router-dom"; 
import Header from "./components/layout/header";
import AppFooter from "./components/footer/app.footer";
import NotificationInit from './components/NotificationInit'; // Import component thông báo
import "./assets/styles/global.css";
import { useEffect } from "react";
import { checkSession } from "./services/api";
import { useAuthContext } from "./contexts/auth.context";

const App = () => {
  const { auth, setAuth } = useAuthContext();
  const location = useLocation();
  
  useEffect(() => {
    const checkAuthOnLoad = async () => {
      const infoUser = await checkSession();
      if(infoUser && infoUser.data){
        setAuth({
          user : infoUser?.data?.user
        })
      }
    }
    checkAuthOnLoad();
  },[]);

  
  // 1. Kiểm tra xem đường dẫn có phải trang Admin không
  const isHomeRoute = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/admin');

  // 2. Kiểm tra xem có phải trang đăng nhập/đăng ký không (Lấy từ đoạn conflict giữa)
  // Bạn có thể thêm "/register" nếu đường dẫn của bạn khác
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";

  // 3. Quyết định xem có ẩn Header/Footer không
  // Ẩn nếu là Admin HOẶC là trang Auth
  const shouldHideHeaderFooter = isAdminRoute || isAuthRoute;

  return (

    

    <>
      {/* 1. Đặt NotificationInit ở đây để nó luôn hoạt động toàn app */}
      <NotificationInit />

      {/* 2. Chỉ hiện Header nếu KHÔNG PHẢI Admin và KHÔNG PHẢI trang Login/Signup */}
      {!shouldHideHeaderFooter && <Header />}
      {!shouldHideHeaderFooter && <div style={{marginBottom:46}}></div> }

      <Outlet />
      {!isHomeRoute && !shouldHideHeaderFooter && <div style={{marginTop:46}}></div> }

      {/* 3. Tương tự với Footer */}
      {!shouldHideHeaderFooter && <AppFooter/>}
    </>
  )
}

export default App;