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
    iconName: "star-outline",
    label: "Favourites",
    screen: "Favourites",
  },
  {
    iconType: "Ionicons",
    iconName: "image-outline",
    label: "Photos",
    screen: "Photos",
  },
  {
    iconType: "Feather",
    iconName: "file-text",
    label: "Draft",
    screen: "Draft",
  },
  {
    iconType: "Feather",
    iconName: "mail",
    label: "Message",
    screen: "Message",
  },
  {
    iconType: "Ionicons",
    iconName: "location-outline",
    label: "Location",
    screen: "Location",
  },
  {
    iconType: "Ionicons",
    iconName: "chatbox-ellipses-outline",
    label: "Chat",
    screen: "Chat",
  },
  {
    iconType: "Ionicons",
    iconName: "log-out-outline",
    label: "Logout",
    isLogout: true,
  },
];
