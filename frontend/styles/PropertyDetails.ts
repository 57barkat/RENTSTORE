import { StyleSheet } from "react-native";

export const stepperStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#717171",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    borderColor: "#ccc",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
});
export const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
    marginBottom: 30,
  },
  listContainer: {
    // No additional styling needed here as StepperRow handles the layout
  },
});
