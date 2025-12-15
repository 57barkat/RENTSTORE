import { StyleSheet } from "react-native";

export const sidebarStyles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 9,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    paddingTop: 50,
  },
  scrollContent: { paddingBottom: 20 },
  navContainer: { paddingHorizontal: 15 },
});
