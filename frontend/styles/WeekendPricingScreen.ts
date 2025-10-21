import { StyleSheet, Platform } from "react-native";

export const breakdownStyles = StyleSheet.create({
  container: {
    marginTop: 30,
    marginBottom: 20,
  },
  section: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  label: {
    fontSize: 14,
    color: "#333",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export const styles = StyleSheet.create({
  tipText: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
    marginBottom: 20,
    textAlign: "center",
  },
  billInstructionText: {
    fontSize: 14,
    color: "#555", // A slightly darker gray
    marginBottom: 15, // Space below the text and above the first switch
    textAlign: "center", // Center the text for better look
    paddingHorizontal: 10,
  },
  // Monthly rent input
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  currencySymbol: {
    fontSize: 50,
    fontWeight: "700",
    marginRight: 10,
  },
  priceInput: {
    fontSize: 50,
    fontWeight: "700",
    minWidth: 150,
    textAlign: "center",
    paddingVertical: 0,
    height: 90,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  editIcon: {
    marginLeft: 10,
  },

  // Price display (weekend preview)
  priceDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  priceText: {
    fontSize: 80,
    fontWeight: "800",
  },

  // Price toggle
  priceToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  priceToggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginRight: 5,
    textDecorationLine: "underline",
  },

  // Weekend premium slider
  premiumSection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  premiumHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  premiumLabel: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  premiumTip: {
    fontSize: 14,
    color: "#717171",
    marginRight: 10,
  },
  premiumValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderMarks: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 5,
    marginTop: -10,
  },
  sliderMarkText: {
    fontSize: 12,
    color: "#717171",
  },

  // Bills switches
  billsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  billLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
});
