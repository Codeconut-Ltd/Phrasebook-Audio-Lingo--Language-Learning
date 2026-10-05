import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  /** Theme applied on first render (before any stored preference is read). */
  defaultTheme?: ThemeMode;
  /** localStorage key used to remember the choice. */
  storageKey?: string;
}

/**
 * Applies `data-theme` to the document root so the theme's dark tokens take
 * effect. Wrap the app once, at the root.
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "codeconut-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as ThemeMode | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    }
  }, [storageKey]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setThemeState(next);
      window.localStorage.setItem(storageKey, next);
    },
    [storageKey],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Read and change the active theme. Requires a `ThemeProvider` ancestor. */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
