import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  inputContainer: {
    marginVertical: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },
    modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16, 
    textAlignVertical: "top",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  countryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  countryOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  countrySelected: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  countryText: {
    color: "#555",
  },
  countryTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});
