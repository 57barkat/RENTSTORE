import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

export default function Logo() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="home-city"
        size={40}
        color={currentTheme.secondary}
      />
      <Text style={[styles.text, { color: currentTheme.text }]}>
        Rent
        <Text style={[styles.accent, { color: currentTheme.secondary }]}>
          Store
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
    marginVertical: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 8,
  },
  accent: {
    // Color is now handled dynamically via props
  },
});
