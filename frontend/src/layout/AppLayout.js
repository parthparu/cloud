import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { APP_NAME } from "../config";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the user navigates
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  return (
    <div className={`app ${drawerOpen ? "app--drawer-open" : ""}`}>
      <div className="app__mobilebar">
        <button type="button" className="icon-button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
          <FiMenu />
        </button>
        <span className="wordmark">{APP_NAME}</span>
      </div>
      <Sidebar />
      <div className="app__scrim" onClick={() => setDrawerOpen(false)} />
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  );
}
