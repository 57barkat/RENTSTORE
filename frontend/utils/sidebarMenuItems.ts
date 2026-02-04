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
    iconName: "chatbubble-outline",
    label: "Chats",
    screen: "ChatListScreen",
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
    iconName: "plus-square",
    label: "Upload Property",
    screen: "upload",
  },
  {
    iconType: "Feather",
    iconName: "edit-3",
    label: "Draft Property",
    screen: "DraftProperties",
  },
  {
    iconType: "Feather",
    iconName: "user-x",
    label: "Delete Account",
    screen: "DeleteAccount",
  },
  {
    iconType: "Ionicons",
    iconName: "shield-checkmark-outline",
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
