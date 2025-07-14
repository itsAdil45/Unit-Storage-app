import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: Theme;
  isThemeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  theme: DefaultTheme,
  isThemeLoaded: false,
});

export const useThemeContext = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = '@theme_preference';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load theme preference from AsyncStorage on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsThemeLoaded(true);
    }
  };

  const saveThemePreference = async (themeValue: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeValue));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      saveThemePreference(newTheme);
      return newTheme;
    });
  };

  const theme = isDark ? DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider
      value={{ isDark, toggleTheme, theme, isThemeLoaded }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
