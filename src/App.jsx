import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/layout/header";
import AppFooter from "./components/footer/app.footer";
import "./assets/styles/global.css";


const App = () => {
  const location = useLocation();
  const { pathname } = location;
  const hideLayout = pathname === "/login" || pathname === "/signup";
  return (
    <>
          {!hideLayout && <Header />}
          <Outlet />
          {!hideLayout && <AppFooter/>}
    </>
  )
}

export default App;