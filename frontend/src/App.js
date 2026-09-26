import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { GuestOnly, RequireAuth } from "./routes/RouteGuards";
import AppLayout from "./layout/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import FriendsPage from "./pages/friends/FriendsPage";
import SpacePage from "./pages/channel/SpacePage";
import ChannelPage from "./pages/channel/ChannelPage";
import InvitePage from "./pages/invite/InvitePage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<GuestOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path="/invite/:code" element={<InvitePage />} />
              <Route element={<AppLayout />}>
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/spaces/:spaceId" element={<SpacePage />} />
                <Route path="/spaces/:spaceId/:channelId" element={<ChannelPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/friends" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
