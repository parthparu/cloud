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

  // Resolves to { twoFactorRequired, challengeToken } when a code is still needed,
  // otherwise signs in and resolves to { twoFactorRequired: false }
  const login = async (email, password) => {
    const result = await api("/auth/login", { method: "POST", body: { email, password } });
    if (result.twoFactorRequired) {
      return { twoFactorRequired: true, challengeToken: result.challengeToken };
    }
    acceptSession(result);
    return { twoFactorRequired: false };
  };

  // Second sign-in step: an authenticator code or a recovery code
  const completeTwoFactor = async (challengeToken, code) =>
    acceptSession(await api("/auth/login/2fa", { method: "POST", body: { challengeToken, code } }));

  // Keep the cached user in step after 2FA is turned on or off in settings
  const updateUser = (changes) => setUser((current) => (current ? { ...current, ...changes } : current));

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
    <AuthContext.Provider value={{ user, token, status, login, completeTwoFactor, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
