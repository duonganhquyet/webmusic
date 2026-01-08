import Tab from "../../components/Library/Tab/Tab";
import "./Library.css";

export default function Library() {
  return (
    <div className="library-page">
      <h2>My Library</h2>
      <Tab initial="general" />
    </div>
  );
}
