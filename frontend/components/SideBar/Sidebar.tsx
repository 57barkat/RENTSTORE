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
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation,
  useDeleteUserMutation,
  useLogoutMutation,
} from "@/services/api";
import Toast from "react-native-toast-message";
import { usePathname, useRouter } from "expo-router";
import { useAuth } from "@/contextStore/AuthContext";
import { useLength } from "@/contextStore/LengthContext";
import { useUserStats } from "@/contextStore/UserStatsContext";

const Sidebar: React.FC = () => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const { isOpen, close } = useSidebar();
  const { theme, setTheme } = useTheme();
  const themeColors = Colors[theme];
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { fav, upload, setUpload, unread } = useLength();
  const scrollViewRef = useRef<ScrollView | null>(null);

  const { stats, refetch } = useUserStats();

  useEffect(() => {
    if (stats?.totalProperties !== undefined) {
      setUpload(stats.totalProperties);
    }
  }, [stats]);

  const [uploadProfileImage] = useUploadProfileImageMutation();
  const [deleteProfileImage] = useDeleteProfileImageMutation();
  const [logoutApi] = useLogoutMutation();

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    slideAnimation(slideAnim, isOpen, SIDEBAR_WIDTH);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    });
  }, [isOpen]);

  const normalizeScreenPath = (screen?: string) => {
    if (!screen) {
      return "";
    }

    if (screen === "homePage") {
      return "/homePage";
    }

    return screen.startsWith("/") ? screen : `/${screen}`;
  };

  const isItemActive = (screen?: string) => {
    const normalized = normalizeScreenPath(screen);

    if (!normalized) {
      return false;
    }

    if (normalized === "/upload") {
      return pathname === "/upload" || pathname.startsWith("/upload/");
    }

    return pathname === normalized;
  };

  const handleUpload = async (formData: FormData) => {
    try {
      setLoadingUpload(true);
      await uploadProfileImage(formData).unwrap();
      Toast.show({ type: "success", text1: "Profile uploaded" });
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

  const handleNavigate = (item: MenuItem) => {
    if (item.isLogout) {
      handleLogout();
    } else if (item.screen === "DeleteAccount") {
      // handleDeleteAccount();
    } else if (item.screen) {
      const path = normalizeScreenPath(item.screen);

      if (path === pathname) {
        close();
        return;
      }

      router.replace(path);
      close();
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
    } finally {
      setTheme("light");
      close();
      await logout();
      router.replace("/signin");
    }
  };

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
          },
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader
            profileImage={stats?.profileImage || null}
            name={stats?.name || "User"}
            phone={stats?.phone}
            subscription={user?.subscription}
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
                isActive={isItemActive(item.screen)}
                badgeCount={
                  item.screen === "favorites"
                    ? fav
                    : item.screen === "MyListingsScreen"
                      ? upload
                      : item.screen === "ChatListScreen"
                        ? unread
                        : undefined
                }
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
              color={themeColors.danger}
              onPress={handleLogout}
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
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  scrollContent: { paddingHorizontal: 15, paddingTop: 10 },
  separator: {
    height: 1,
    width: "90%",
    alignSelf: "center",
    marginVertical: 5,
  },
  navContainer: { paddingHorizontal: 15, paddingVertical: 10 },
  bottomContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 35,
    borderTopWidth: 2,
  },
});

export default Sidebar;
