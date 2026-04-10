import { View, StyleSheet, Image } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
const LightLogo = require("@/assets/images/light.png");
const DarkLogo = require("@/assets/images/dark.png");

export default function Logo() {
  const { theme } = useTheme();

  const logoSource = theme === "dark" ? DarkLogo : LightLogo;

  return (
    <View style={styles.container}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  logo: {
    width: 180,
    height: 60,
  },
});
