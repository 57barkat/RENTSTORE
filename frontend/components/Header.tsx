import { View, StyleSheet, Platform, StatusBar } from "react-native";
import Logo from "./logo";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";

export default function Header() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const headerBg = theme === "light" ? "#e54646" : currentTheme.primary;

  return (
    <View style={[styles.container, { backgroundColor: headerBg }]}>
      <Logo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 44,
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
