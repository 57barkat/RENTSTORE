import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Logo() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="home-city" size={40} color="#4F46E5" />
      <Text style={styles.text}>
        Rent<Text style={styles.accent}>Store</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
    marginVertical: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  accent: {
    color: "#4F46E5",
  },
});
