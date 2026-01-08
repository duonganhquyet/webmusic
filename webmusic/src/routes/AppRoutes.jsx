// Router setup 
import { Routes, Route } from "react-router-dom";

import Library from "../pages/Library/Library";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";

function AppRoutes() {
  return (
    <Routes>
      {/* <Route path="/" element={<Home />} />
      <Route path="/feed" element={<Feed />} /> */}
      <Route path="/library" element={<Library />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}
 
export default AppRoutes;
