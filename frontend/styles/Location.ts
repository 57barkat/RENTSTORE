import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  focusedInput: {
    borderColor: "#000",
    borderWidth: 2,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
  },
  mapCredit: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 5,
    marginBottom: 5,
  },
});
