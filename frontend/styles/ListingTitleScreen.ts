import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
    marginBottom: 30,
    fontWeight: "500",
  },
  inputContainer: {
    flex: 1,
    position: "relative",
  },
  textInput: {
    minHeight: 150,
    padding: 16,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "600",
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  charCount: {
    position: "absolute",
    bottom: 10,
    right: 16,
    fontSize: 14,
    color: "#717171",
  },
});