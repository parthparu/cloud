import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, onUnauthorized, tokenStore } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(tokenStore.get);
  // "checking" until a stored token has been validated against /auth/me
  const [status, setStatus] = useState(token ? "checking" : "signedOut");

  const signOutLocally = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
    setStatus("signedOut");
  }, []);

  useEffect(() => onUnauthorized(signOutLocally), [signOutLocally]);

  useEffect(() => {
    if (!token || user) return;

    api("/auth/me")
      .then(({ user }) => {
        setUser(user);
        setStatus("signedIn");
      })
      .catch(signOutLocally);
  }, [token, user, signOutLocally]);

  const acceptSession = ({ token, user }) => {
    tokenStore.set(token);
    setToken(token);
    setUser(user);
    setStatus("signedIn");
  };

  const login = async (email, password) =>
    acceptSession(await api("/auth/login", { method: "POST", body: { email, password } }));

  const register = async (username, email, password) =>
    acceptSession(await api("/auth/register", { method: "POST", body: { username, email, password } }));

  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Signing out locally is what matters; the server marks us offline on disconnect anyway
    }
    signOutLocally();
  };

  return (
    <AuthContext.Provider value={{ user, token, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
