import React, { useRef, useEffect } from "react";
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
import { sidebarMenuItems } from "@/utils/sidebarMenuItems";
import { slideAnimation } from "@/utils/animations";
import { useSidebarNavigation } from "@/hooks/useSidebarNavigation";
import { Colors } from "@/constants/Colors";
import ProfileHeader from "./ProfileHeader";
import {
  useGetUserStatsQuery,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation, // <-- added
} from "@/services/api";
import Toast from "react-native-toast-message";

const Sidebar: React.FC = () => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const { isOpen, close } = useSidebar();
  const { theme } = useTheme();
  const { handleNavigate, handleLogout } = useSidebarNavigation();
  const themeColors = Colors[theme];

  const { data: stats, refetch } = useGetUserStatsQuery(null, {
    refetchOnFocus: true,
    pollingInterval: 5000,
  });

  const [uploadProfileImage] = useUploadProfileImageMutation();
  const [deleteProfileImage] = useDeleteProfileImageMutation();

  // --------------------------
  // Loading states
  // --------------------------
  const [loadingUpload, setLoadingUpload] = React.useState(false);
  const [loadingDelete, setLoadingDelete] = React.useState(false);

  useEffect(() => {
    slideAnimation(slideAnim, isOpen, SIDEBAR_WIDTH);
  }, [isOpen]);

  const handleUpload = async (formData: FormData) => {
    try {
      setLoadingUpload(true); // start loading
      await uploadProfileImage(formData).unwrap();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile image uploaded",
      });
      refetch();
    } catch {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: "Could not upload profile image",
      });
    } finally {
      setLoadingUpload(false); // stop loading
    }
  };

  const handleDelete = async () => {
    try {
      setLoadingDelete(true); // start loading
      await deleteProfileImage().unwrap();
      Toast.show({
        type: "success",
        text1: "Deleted",
        text2: "Profile image removed",
      });
      refetch();
    } catch {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: "Could not remove profile image",
      });
    } finally {
      setLoadingDelete(false); // stop loading
    }
  };

  const mainMenuItems = sidebarMenuItems.filter((item) => !item.isLogout);
  const logoutItem = sidebarMenuItems.find((item) => item.isLogout);

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={close}
          activeOpacity={1}
        />
      )}

      <Animated.View
        style={[
          styles.sidebar,
          {
            width: SIDEBAR_WIDTH,
            backgroundColor: themeColors.background,
            transform: [{ translateX: slideAnim }],
            borderRightColor: themeColors.card,
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
            loadingUpload={loadingUpload} // <-- new
            loadingDelete={loadingDelete} // <-- new
          />

          <View
            style={[
              styles.separator,
              { backgroundColor: themeColors.secondary + "30" },
            ]}
          />

          <View style={styles.navContainer}>
            {mainMenuItems.map((item, index) => (
              <NavItem
                key={index}
                item={item}
                theme={theme}
                color={themeColors.secondary}
                onPress={() => handleNavigate(item.screen!)}
                isActive={false}
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
    paddingTop: 0,
    borderRightWidth: 1,
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
    paddingTop: 10,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
});

export default Sidebar;
