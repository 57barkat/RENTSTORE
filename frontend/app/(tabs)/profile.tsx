import {
  View,
  Text,
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/contextStore/AuthContext";
import { styles } from "@/styles/profile";
 

export default function Profile() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const navigation = useNavigation();
  const { logout } = useAuth();
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
      await deleteUser(undefined).unwrap();
      Alert.alert("Deleted!", "Your account has been removed.", [
        {
          text: "OK",
          onPress: () => {
            logout();
            router.replace("/signin");
          },
        },
      ]);
      await AsyncStorage.clear();
    } catch (err) {
      console.error("Delete failed:", err);
      Alert.alert("Error", "Failed to delete your account.");
    }
  };

  const renderHeader = () => (
    <>
      <View
        style={[styles.profileHeader, { backgroundColor: currentTheme.card }]}
      >
        <Image
          source={{
            uri: "https://media.istockphoto.com/id/1171346911/photo/drawing-of-a-happy-smiling-emoticon-on-a-yellow-paper-and-white-background.jpg?b=1&s=612x612&w=0&k=20&c=5QekOSZckKrO6_bpz6l9awWGhC3_b7tXjRCFQMfaoaI=",
          }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: currentTheme.text }]}>
          {name || "Guest"}
        </Text>
        <Text style={[styles.email, { color: currentTheme.secondary }]}>
          {email || "guest@example.com"}
        </Text>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: currentTheme.card }]}
          onPress={() => navigation.navigate("MyListingsScreen" as never)}
        >
          <MaterialCommunityIcons
            name="home-city-outline"
            size={24}
            color={currentTheme.primary}
          />
          <Text style={[styles.buttonText, { color: currentTheme.text }]}>
            View My Listings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: currentTheme.card }]}
          onPress={() => router.push("/favorites")}
        >
          <MaterialCommunityIcons
            name="star-outline"
            size={24}
            color={currentTheme.primary}
          />
          <Text style={[styles.buttonText, { color: currentTheme.text }]}>
            See My Favorite Properties
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderFooter = () => (
    <TouchableOpacity
      style={[styles.deleteButton, { backgroundColor: currentTheme.danger }]}
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
      <MaterialCommunityIcons name="delete-outline" size={24} color="#fff" />
      <Text style={styles.deleteButtonText}>Delete Account</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      renderItem={null}
      keyExtractor={(item) => item.key}
      style={{ flex: 1, backgroundColor: currentTheme.background }}
      contentContainerStyle={styles.container}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
    />
  );
}


