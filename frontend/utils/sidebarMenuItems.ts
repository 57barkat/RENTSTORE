export interface MenuItem {
  iconType: "Ionicons" | "Feather";
  iconName: string;
  label: string;
  screen?: string;
  isLogout?: boolean;
}
export const sidebarMenuItems: MenuItem[] = [
  {
    iconType: "Ionicons",
    iconName: "home-outline",
    label: "Home",
    screen: "homePage",
  },
  {
    iconType: "Ionicons",
    iconName: "star-outline",
    label: "Favorites",
    screen: "favorites",
  },
  {
    iconType: "Feather",
    iconName: "grid",
    label: "View My Listings",
    screen: "MyListingsScreen",
  },
  {
    iconType: "Feather",
    iconName: "upload",
    label: "Upload Property",
    screen: "upload",
  },

  {
    iconType: "Feather",
    iconName: "trash-2",
    label: "Delete Account",
    screen: "DeleteAccount",
  },
  {
    iconType: "Ionicons",
    iconName: "document-text-outline",
    label: "Privacy Policy",
    screen: "PrivacyPolicyScreen",
  },

  {
    iconType: "Ionicons",
    iconName: "log-out-outline",
    label: "Logout",
    isLogout: true,
  },
];
