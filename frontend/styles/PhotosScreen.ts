import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
    marginBottom: 30,
  },
  uploadArea: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  cameraIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  statusText: {
    marginTop: 20,
    fontSize: 14,
    color: "#717171",
  },
  uploadButton: {
    flexDirection: "row",
    gap:5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBEBEB",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#CCC",
  },

  // --- New Styles for Image Grid ---
  imageList: {
    flex: 1,
    marginTop: 10,
  },
  imageGridContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: "30%", // Approx. 3 images per row (100% / 3)
    aspectRatio: 1, // Make it a square
    margin: "1.66%", // Small margin for spacing (to make 30% * 3 = 90%)
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 2,
  },
});
