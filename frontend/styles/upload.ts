import { StyleSheet } from "react-native";

// export const styles = StyleSheet.create({
//   container: { padding: 20 },
//   header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
//   button: {
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginVertical: 20,
//   },
//   buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
// });
export const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  selectedCard: {
    borderColor: "#000",
    borderWidth: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
});
