"use client";

import * as React from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export const THEME_STORAGE_KEY = "wk-toto-theme";

/** Inline script: applies the stored theme before paint to avoid a flash. */
export const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (!t) t = 'dark';
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("dark");

  React.useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "dark";
    setThemeState(stored);
  }, []);

  const apply = React.useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: apply,
      toggleTheme: () => apply(theme === "dark" ? "light" : "dark"),
    }),
    [theme, apply]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
