import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  cardIcon: {
    marginRight: 15,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 43,
  },
});