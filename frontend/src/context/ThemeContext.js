import { createContext, useCallback, useContext, useEffect, useState } from "react";

const THEME_KEY = "chatscale.theme";
const ThemeContext = createContext(null);

// public/index.html applies the saved theme before first paint; this reads it back
const readInitialTheme = () =>
  document.documentElement.dataset.theme ||
  (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
