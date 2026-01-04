import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/layout/header";
import AppFooter from "./components/footer/app.footer";
import "./assets/styles/global.css";
import { useEffect } from "react";
import { checkSession } from "./services/api";
import { useAuthContext } from "./contexts/auth.context";


const App = () => {
  const { auth, setAuth } = useAuthContext();
  const location = useLocation();
  const { pathname } = location;
  const hideLayout = pathname === "/login" || pathname === "/signup";
  
  useEffect(() => {
    const checkAuthOnLoad = async () => {
      const infoUser = await checkSession();
      if(infoUser && infoUser.data){
        setAuth({
          user : infoUser.data.user
        })
      }
    }
    checkAuthOnLoad();
  },[]);


  return (

    

    <>
          {!hideLayout && <Header /> }
          {!hideLayout && <div style={{marginBottom:46}}></div> }
          <Outlet />
          {!hideLayout && <AppFooter/>}
    </>
  )
}

export default App;