import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";

export default function ChooseRoleScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const handleSelect = async (role: string) => {
    await AsyncStorage.setItem("userRole", role);
    router.push("/signup");
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          What brings you here?
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.muted }]}>
          Please select an option to get started.
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: currentTheme.primary,
              shadowColor: currentTheme.muted,
            },
          ]}
          onPress={() => handleSelect("user")}
        >
          <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
          <Text style={styles.buttonText}>I&apos;m Looking for a Property</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: currentTheme.secondary,
              shadowColor: currentTheme.muted,
            },
          ]}
          onPress={() => handleSelect("renter")}
        >
          <MaterialCommunityIcons name="home-plus-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>I&apos;m Posting My Property</Text>
        </TouchableOpacity>

        {/* This option is disabled based on the original code, but styled for future use */}
        {/* <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: currentTheme.info,
              shadowColor: currentTheme.muted,
            },
          ]}
          onPress={() => handleSelect("agency")}
        >
          <MaterialCommunityIcons name="office-building" size={24} color="#fff" />
          <Text style={styles.buttonText}>I'm an Agency</Text>
        </TouchableOpacity> */}
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    gap: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});