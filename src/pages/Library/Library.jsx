import Tab from "../../components/Library/Tab/Tab";
import { useAuthContext } from "../../contexts/auth.context";
import "./Library.css";

export default function Library() {
  const { auth } = useAuthContext();
  const isLoggedIn = !!(auth && auth.user && auth.user._id);
  return isLoggedIn ? (
    <div className="library-page">
      <h2>My Library</h2>
      <Tab initial="general" />
    </div>
  ) : (
    <div className="library-guest-message">
      <h2>Please log in to access your library.</h2>
    </div>
  );
}
