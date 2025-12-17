import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { useSidebar } from "@/contextStore/SidebarContext";
import { SIDEBAR_WIDTH } from "@/constants/layout";
import NavItem from "./NavItem";
import { sidebarMenuItems, MenuItem } from "@/utils/sidebarMenuItems";
import { slideAnimation } from "@/utils/animations";
import { Colors } from "@/constants/Colors";
import ProfileHeader from "./ProfileHeader";
import {
  useGetUserStatsQuery,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation,
  useDeleteUserMutation,
} from "@/services/api";
import Toast from "react-native-toast-message";
import { useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contextStore/AuthContext";

const Sidebar: React.FC = () => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const { isOpen, close } = useSidebar();
  const { theme, setTheme } = useTheme();
  const themeColors = Colors[theme];
  const { logout } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [activeScreen, setActiveScreen] = useState<string>("homePage");

  // --------------------------
  // User stats
  // --------------------------
  const { data: stats, refetch } = useGetUserStatsQuery(null, {
    refetchOnFocus: true,
    pollingInterval: 5000,
  });

  const [uploadProfileImage] = useUploadProfileImageMutation();
  const [deleteProfileImage] = useDeleteProfileImageMutation();
  const [deleteAccount] = useDeleteUserMutation();

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingDeleteAccount, setLoadingDeleteAccount] = useState(false);

  // --------------------------
  // Slide animation
  // --------------------------
  useEffect(() => {
    slideAnimation(slideAnim, isOpen, SIDEBAR_WIDTH);
  }, [isOpen]);

  // --------------------------
  // Profile image handlers
  // --------------------------
  const handleUpload = async (formData: FormData) => {
    try {
      setLoadingUpload(true);
      await uploadProfileImage(formData).unwrap();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile uploaded",
      });
      refetch();
    } catch {
      Toast.show({ type: "error", text1: "Upload Failed" });
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);
      await deleteProfileImage().unwrap();
      Toast.show({ type: "success", text1: "Profile deleted" });
      refetch();
    } catch {
      Toast.show({ type: "error", text1: "Delete Failed" });
    } finally {
      setLoadingDelete(false);
    }
  };

  // --------------------------
  // Delete account
  // --------------------------
  const handleDeleteAccount = async () => {
    try {
      setLoadingDeleteAccount(true);
      // await deleteAccount().unwrap();
      Toast.show({ type: "success", text1: "Account Deleted" });
      router.replace("/signin");
      close();
    } catch {
      Toast.show({ type: "error", text1: "Could not delete account" });
    } finally {
      setLoadingDeleteAccount(false);
    }
  };

  // --------------------------
  // Navigation handler
  // --------------------------
  const handleNavigate = (item: MenuItem) => {
    if (item.isLogout) {
      // Clear auth/token logic
      router.replace("/signin");
      close();
    } else if (item.screen === "DeleteAccount") {
      handleDeleteAccount();
    } else if (item.screen) {
      setActiveScreen(item.screen);
      router.push(`/${item.screen}`);
      close();
    }
  };
  const handleLogout = async () => {
    await AsyncStorage.clear();
    setTheme("light");
    close();
    router.replace("/signin");
    await logout();
  };
  // --------------------------
  // Update active screen based on route
  // --------------------------
  useEffect(() => {
    const current = segments[segments.length - 1];
    if (current) setActiveScreen(current);
  }, [segments]);

  const mainMenuItems = sidebarMenuItems.filter((i) => !i.isLogout);
  const logoutItem = sidebarMenuItems.find((i) => i.isLogout);

  return (
    <>
      {isOpen && <TouchableOpacity style={styles.backdrop} onPress={close} />}

      <Animated.View
        style={[
          styles.sidebar,
          {
            width: SIDEBAR_WIDTH,
            backgroundColor: themeColors.background,
            transform: [{ translateX: slideAnim }],
            // borderRightColor is replaced by shadow
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader
            profileImage={stats?.profileImage || null}
            name={stats?.name || "User"}
            phone={stats?.phone || "unverified account"}
            uploads={stats?.totalProperties || 0}
            favorites={stats?.totalFavorites || 0}
            theme={theme}
            onUpload={handleUpload}
            onDelete={handleDelete}
            loadingUpload={loadingUpload}
            loadingDelete={loadingDelete}
          />

          <View
            style={[
              styles.separator,
              { backgroundColor: themeColors.secondary + "30" },
            ]}
          />

          <View style={styles.navContainer}>
            {mainMenuItems.map((item, idx) => (
              <NavItem
                key={idx}
                item={item}
                theme={theme}
                color={themeColors.secondary}
                onPress={() => handleNavigate(item)}
                isActive={activeScreen === item.screen}
              />
            ))}
          </View>
        </ScrollView>

        {logoutItem && (
          <View
            style={[
              styles.bottomContainer,
              { borderTopColor: themeColors.card },
            ]}
          >
            <NavItem
              item={logoutItem}
              theme={theme}
              color={themeColors.text}
              onPress={() => handleLogout()}
              isActive={false}
            />
          </View>
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    paddingTop: 0,
    borderRightWidth: 0, // Removed static border
    // Added Box Shadow/Elevation for a next-level overlay effect
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  separator: {
    height: 1,
    width: "90%",
    alignSelf: "center",
    marginVertical: 15,
  },
  navContainer: {
    paddingHorizontal: 5,
    paddingBottom: 20,
  },
  bottomContainer: {
    paddingHorizontal: 15,
    paddingTop: 15, // Increased padding
    paddingBottom: 35, // Increased bottom padding
    borderTopWidth: 2, // Thicker border for clear separation
  },
});

export default Sidebar;
