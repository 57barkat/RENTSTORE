import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 50,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
});
export const itemStyles = StyleSheet.create({
  stepContainer: {
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  textContainer: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 4,
  },
  stepTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  stepDescription: { fontSize: 14, color: "#777", lineHeight: 20 },
  stepIcon: { opacity: 0.6, alignSelf: "center" },
});
