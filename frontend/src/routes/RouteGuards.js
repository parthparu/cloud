import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { WorkspaceProvider } from "../context/WorkspaceContext";

// Blank screen while a stored session is being checked, so nothing flickers
function Splash() {
  return <div className="splash" aria-busy="true" />;
}

// Signed-in area: sends visitors to sign in, then back to where they were headed
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "checking") return <Splash />;
  if (status === "signedOut") {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return (
    <WorkspaceProvider>
      <Outlet />
    </WorkspaceProvider>
  );
}

// Sign-in pages: already signed-in users skip straight into the app
export function GuestOnly() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "checking") return <Splash />;
  if (status === "signedIn") {
    return <Navigate to={new URLSearchParams(location.search).get("next") || "/friends"} replace />;
  }
  return <Outlet />;
}
