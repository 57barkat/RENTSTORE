import { StyleSheet } from "react-native";

export const cardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
    minHeight: 120,
  },
  cardSelected: {
    borderColor: "#000",
    borderWidth: 2,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  recommendedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "green",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});
export const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
    marginBottom: 30,
  },
  link: {
    color: "#000",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  optionsContainer: {
    // Container for the two cards
  },
});