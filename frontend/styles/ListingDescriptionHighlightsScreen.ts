import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
    marginBottom: 30,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
export const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#717171",
    marginBottom: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  chipSelected: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  labelSelected: {
    color: "#fff",
  },
});
