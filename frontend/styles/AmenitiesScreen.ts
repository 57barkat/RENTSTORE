import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginHorizontal: "-1.5%",
  },
});
export const cardStyles = StyleSheet.create({
  card: {
    width: "47%",
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 15,
    marginHorizontal: "1.5%",
  },
  cardSelected: {
    borderColor: "#000",
    backgroundColor: "#f7f7f7",
    borderWidth: 2,
  },
  icon: {
    marginBottom: 8,
  },
  label: { 
    fontSize: 14,
    fontWeight: "500",
  },
});