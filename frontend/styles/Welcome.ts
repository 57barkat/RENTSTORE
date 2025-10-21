import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 20,
    position: "relative",
  },
  headerButton: {
    borderBlockColor: "#5c5959",
    borderWidth: 1,
    borderStyle: "solid",
    position: "absolute",
    left: 20,
    width: 80,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  closeButton: {
    position: "absolute",
    right: 20,
  },
  content: { flex: 1, paddingHorizontal: 20 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    //  marginBottom: 30
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressBarContainer: {
    height: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: 10,
  },
  progressBar: {
    height: 5,
    backgroundColor: "#000",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 60,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
    color: "#333",
  },
  nextButton: {
    width: 100,
    backgroundColor: "#000",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  disabledNextButton: {
    backgroundColor: "#ccc",
  },
  nextButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
