import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDeleteUserMutation } from "@/services/api";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/contextStore/AuthContext";
import { styles } from "@/styles/profile";
import ConfirmationModal from "@/components/ConfirmDialog";

export default function Profile() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const navigation = useNavigation();
  const { logout } = useAuth();
  const data = [{ key: "dummy" }];
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [deleteUser] = useDeleteUserMutation();

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      setName(storedName);
      setEmail(storedEmail);
    };
    loadUser();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteUser(undefined).unwrap();
      await AsyncStorage.clear();
      logout();
      router.replace("/signin");
    } catch (err) {
      console.error("Delete failed:", err);
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
    <>
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: currentTheme.danger }]}
        onPress={() => setShowModal(true)}
      >
        <MaterialCommunityIcons name="delete-outline" size={24} color="#fff" />
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>

      <ConfirmationModal
        visible={showModal}
        title="Confirm Deletion"
        message="Are you sure you want to delete your account?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          handleDelete();
          setShowModal(false);
        }}
        onCancel={() => setShowModal(false)}
      />
    </>
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
