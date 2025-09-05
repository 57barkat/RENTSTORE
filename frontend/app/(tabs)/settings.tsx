import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { Colors } from "../../constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { useAuth } from "@/contextStore/AuthContext";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await AsyncStorage.clear();
    await AsyncStorage.removeItem("theme");
    router.replace('/signin');
    setTheme("light"); 
    await logout();
  }

  const currentTheme = Colors[theme ?? "light"];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.header, { color: currentTheme.text }]}>Settings</Text>

      {/* Notifications */}
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, { color: currentTheme.text }]}>Enable Notifications</Text>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>

      {/* Dark Mode */}
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, { color: currentTheme.text }]}>Dark Mode</Text>
        <Switch value={theme === "dark"} onValueChange={v => setTheme(v ? "dark" : "light")} />
      </View>

      {/* Change Password */}
      <TouchableOpacity style={styles.option}>
        <Text style={[styles.optionText, { color: currentTheme.text }]}>Change Password</Text>
      </TouchableOpacity>

      {/* Privacy Policy */}
      <TouchableOpacity style={styles.option}>
        <Text style={[styles.optionText, { color: currentTheme.text }]}>Privacy Policy</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: currentTheme.primary }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 , height: '100%'},
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  settingText: { fontSize: 16 },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: { fontSize: 16 },
  logoutButton: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "600" },
});
