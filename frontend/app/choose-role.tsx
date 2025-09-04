import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons"; 
import LOGO from "@/components/logo";

export default function ChooseRoleScreen() {
  const router = useRouter();

  const handleSelect = async (role: string) => {
    await AsyncStorage.setItem("userRole", role);
    router.push("/signup");
  };

  return (
    <View style={styles.container}>
      <LOGO />
      <Text style={styles.title}>What are you here for?</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSelect("user")}
      >
        <MaterialCommunityIcons name="magnify" size={22} color="#fff" />
        <Text style={styles.buttonText}>Looking for a Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSelect("renter")}
      >
        <MaterialCommunityIcons name="home" size={22} color="#fff" />
        <Text style={styles.buttonText}>Post My Property</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSelect("agency")}
      >
        <MaterialCommunityIcons name="office-building" size={22} color="#fff" />
        <Text style={styles.buttonText}>Create an Agency</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { fontSize: 26, fontWeight: "600", marginBottom: 32, color: "#333" },
  button: {
    flexDirection: "row",  
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,  
  },
});
