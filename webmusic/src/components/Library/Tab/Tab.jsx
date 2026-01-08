import { useState, useRef, useEffect } from "react";
import "./Tab.css";

// Import các panels
import GeneralPanel from "./panels/GeneralPanel";
import LikePanel from "./panels/LikePanel";
import PlaylistPanel from "./panels/PlaylistPanel";
import AlbumPanel from "./panels/AlbumPanel";
import FollowingPanel from "./panels/FollowingPanel";
import HistoryPanel from "./panels/HistoryPanel";

const TAB_LIST = [
  { id: "general", label: "General" },
  { id: "like", label: "Like" },
  { id: "playlist", label: "Playlist" },
  { id: "album", label: "Album" },
  { id: "following", label: "Following" },
  { id: "history", label: "History" },
];

export default function Tabs({ initial = "general" }) {
  const [active, setActive] = useState(initial);
  const tabsRef = useRef([]);

  useEffect(() => {
    const node = tabsRef.current[TAB_LIST.findIndex(t => t.id === active)];
    if (node) node.focus();
  }, [active]);

  function onKeyDown(e, idx) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (idx + 1) % TAB_LIST.length;
      setActive(TAB_LIST[next].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (idx - 1 + TAB_LIST.length) % TAB_LIST.length;
      setActive(TAB_LIST[prev].id);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(TAB_LIST[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(TAB_LIST[TAB_LIST.length - 1].id);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActive(TAB_LIST[idx].id);
    }
  }

  return (
    <div className="tabs-wrapper">
      <div role="tablist" aria-label="Library tabs" className="tabs">
        {TAB_LIST.map((t, idx) => (
          <button
            key={t.id}
            ref={(el) => (tabsRef.current[idx] = el)}
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            className={`tab-btn ${active === t.id ? "active" : ""}`}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKeyDown(e, idx)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-panels">
        <TabPanel id="general" active={active === "general"}>
          <GeneralPanel />
        </TabPanel>

        <TabPanel id="like" active={active === "like"}>
          <LikePanel />
        </TabPanel>

        <TabPanel id="playlist" active={active === "playlist"}>
          <PlaylistPanel />
        </TabPanel>

        <TabPanel id="album" active={active === "album"}>
          <AlbumPanel />
        </TabPanel>

        <TabPanel id="following" active={active === "following"}>
          <FollowingPanel />
        </TabPanel>

        <TabPanel id="history" active={active === "history"}>
          <HistoryPanel />
        </TabPanel>
      </div>
    </div>
  );
}

function TabPanel({ id, active, children }) {
  return (
    <div
      id={`panel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      hidden={!active}
      className={`tab-panel ${active ? "show" : ""}`}
    >
      {children}
    </div>
  );
}