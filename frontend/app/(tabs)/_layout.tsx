import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";

export default function TabLayout() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const activeTabColor = theme === "light" ? "#4F46E5" : currentTheme.secondary;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTabColor,
        tabBarInactiveTintColor: currentTheme.tabIconDefault,
        tabBarStyle: { backgroundColor: currentTheme.card },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="homePage"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloud-upload" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
