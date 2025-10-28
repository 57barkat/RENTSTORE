import React, { useState } from "react";
import {
  View,
  Text,
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
import { styles } from "@/styles/settings";

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
        {/* <SettingItem
          label="Enable Notifications"
          icon="bell-outline"
          isSwitch
          switchValue={notifications}
          onSwitchChange={setNotifications}
          theme={currentTheme}
        /> */}
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

