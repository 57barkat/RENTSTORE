import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { useAuth } from "@/contextStore/AuthContext";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Reusable component for a single setting item
const SettingItem = ({
  label,
  icon,
  onPress,
  isSwitch,
  switchValue,
  onSwitchChange,
  theme,
}: any) => {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.settingLabelGroup}>
        <MaterialCommunityIcons name={icon} size={24} color={theme.text} style={styles.icon} />
        <Text style={[styles.settingText, { color: theme.text }]}>
          {label}
        </Text>
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={theme.card}
        />
      ) : (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.muted}
        />
      )}
    </TouchableOpacity>
  );
};

// Reusable component for grouping settings into a card
const SettingCard = ({ children, theme }: any) => (
  <View style={[styles.card, { backgroundColor: theme.card }]}>
    {children}
  </View>
);

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const currentTheme = Colors[theme ?? "light"];

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setTheme("light");
    router.replace("/signin");
    await logout();
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: currentTheme.background },
      ]}
    >
      <Text style={[styles.header, { color: currentTheme.text }]}>Settings</Text>

      {/* General Settings Card */}
      <SettingCard theme={currentTheme}>
        <SettingItem
          label="Enable Notifications"
          icon="bell-outline"
          isSwitch
          switchValue={notifications}
          onSwitchChange={setNotifications}
          theme={currentTheme}
        />
        <View style={styles.divider} />
        <SettingItem
          label="Dark Mode"
          icon="theme-light-dark"
          isSwitch
          switchValue={theme === "dark"}
          onSwitchChange={(v: boolean) => setTheme(v ? "dark" : "light")}
          theme={currentTheme}
        />
      </SettingCard>

      {/* Account Settings Card */}
      <SettingCard theme={currentTheme}>
        {/* <SettingItem
          label="Change Password"
          icon="lock-outline"
          onPress={() => router.push('/ChangePasswordScreen')} // Add your navigation path here
          theme={currentTheme}
        /> */}
        <View style={styles.divider} />
        <SettingItem
          label="Privacy Policy"
          icon="file-document-outline"
          onPress={() => router.push("/PrivacyPolicyScreen")}
          theme={currentTheme}
        />
      </SettingCard>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: currentTheme.danger }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  settingLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)", // Use a consistent divider color
    marginVertical: 5,
  },
  logoutButton: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});