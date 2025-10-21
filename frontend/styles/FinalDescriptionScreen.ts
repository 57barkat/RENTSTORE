import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
    marginBottom: 30,
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    minHeight: 200,
    padding: 16,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    fontSize: 18,
    textAlignVertical: "top",
  },
  charCount: {
    position: "absolute",
    bottom: 10,
    left: 15,
    fontSize: 14,
    color: "#717171",
  },
});