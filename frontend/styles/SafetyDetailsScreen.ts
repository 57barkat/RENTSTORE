import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
  checkboxItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#222",
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  checkboxCheck: {
    color: "#fff",
    fontWeight: "bold",
  },
  descriptionContainer: {
    paddingLeft: 8,
    paddingBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  editButton: {
    paddingVertical: 6,
    width: 60,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: "#888",
  },
  continueButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  continueButtonDisabled: {
    backgroundColor: "#ccc",
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalClose: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 6,
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: "700",
  },
});