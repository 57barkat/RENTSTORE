import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeType = "light" | "dark";

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  resetToSystem: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  resetToSystem: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = Appearance.getColorScheme() ?? "light";
  const [theme, setThemeState] = useState<ThemeType>(systemScheme);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("theme");

      if (storedTheme === "light" || storedTheme === "dark") {
        setThemeState(storedTheme);
      } else {
        setThemeState(systemScheme);
      }
    };

    loadTheme();
  }, [systemScheme]);

  // 🔁 React to system theme changes ONLY if user didn't override
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem("theme").then((storedTheme) => {
        if (!storedTheme && colorScheme) {
          setThemeState(colorScheme as ThemeType);
        }
      });
    });

    return () => subscription.remove();
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  };

  const resetToSystem = async () => {
    await AsyncStorage.removeItem("theme");
    const systemTheme = Appearance.getColorScheme() ?? "light";
    setThemeState(systemTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetToSystem }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
