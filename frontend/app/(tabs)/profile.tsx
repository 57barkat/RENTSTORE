import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDeleteUserMutation } from "@/services/api";
import { router } from "expo-router";

export default function Profile() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const navigation = useNavigation();

  const data = [{ key: "dummy" }];
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      setName(storedName);
      setEmail(storedEmail);
    };
    loadUser();
  }, []);

  const [deleteUser] = useDeleteUserMutation();
  const handleDelete = async () => {
    try {
      await deleteUser().unwrap();
      Alert.alert("Deleted!", "Your account has been removed.");
      router.push("signin" as never);
    } catch (err) {
      console.error("Delete failed:", err);
      Alert.alert("Error", "Failed to delete your account.");
    }
  };
  return (
    <FlatList
      data={data}
      renderItem={null}
      keyExtractor={(item) => item.key}
      style={{ flex: 1, backgroundColor: currentTheme.background }}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Image
              source={{ uri: "https://media.istockphoto.com/id/1171346911/photo/drawing-of-a-happy-smiling-emoticon-on-a-yellow-paper-and-white-background.jpg?b=1&s=612x612&w=0&k=20&c=5QekOSZckKrO6_bpz6l9awWGhC3_b7tXjRCFQMfaoaI=" }}
              style={styles.avatar}
            />
            <Text style={[styles.name, { color: currentTheme.text }]}>
              {name || "Guest"}
            </Text>
            <Text style={[styles.email, { color: currentTheme.muted }]}>
              {email || "guest@example.com"}
            </Text>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.listingsButton,
                { backgroundColor: currentTheme.primary },
              ]}
              onPress={() => navigation.navigate("MyListingsScreen" as never)}
            >
              <Text style={styles.listingsButtonText}>View My Listings</Text>
            </TouchableOpacity>
            <TouchableOpacity
               style={[
                styles.listingsButton,
                { backgroundColor: currentTheme.primary },
              ]}
              onPress={() => router.push("/favorites")}
            >
              <Text style={styles.listingsButtonText}>
                ⭐ See My Favorite Properties
              </Text>
            </TouchableOpacity>
          </View>
        </>
      }
      ListFooterComponent={
        <TouchableOpacity
          style={[
            styles.listingsButton,
            { backgroundColor: currentTheme.primary },
          ]}
          onPress={() => {
            Alert.alert(
              "Confirm Deletion",
              "Are you sure you want to delete your account?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDelete(),
                },
              ]
            );
          }}
        >
          <Text style={styles.listingsButtonText}>Delete Account</Text>
        </TouchableOpacity>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: "bold" },
  email: { fontSize: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  listingsButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  listingsButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "600" },
});
