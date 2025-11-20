import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
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
import Toast from "react-native-toast-message";

export default function Profile() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const navigation = useNavigation();
  const { logout } = useAuth();
  const data = [{ key: "dummy" }];
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

      Toast.show({
        type: "success",
        text1: "Account Deleted",
        text2: "Your account has been removed.",
      });

      logout();
      router.replace("/signin");
      await AsyncStorage.clear();
    } catch (err) {
      console.error("Delete failed:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete your account.",
      });
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
          {name || "Person"}
        </Text>
        <Text style={[styles.email, { color: currentTheme.secondary }]}>
          {email || "Person@example.com"}
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
      onPress={() => setShowDeleteModal(true)}
    >
      <MaterialCommunityIcons name="delete-outline" size={24} color="#fff" />
      <Text style={styles.deleteButtonText}>Delete Account</Text>
    </TouchableOpacity>
  );

  return (
    <>
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

      {/* DELETE CONFIRMATION MODAL */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View
            style={[modalStyles.box, { backgroundColor: currentTheme.card }]}
          >
            <Text style={[modalStyles.title, { color: currentTheme.text }]}>
              Delete Account?
            </Text>

            <Text
              style={[modalStyles.message, { color: currentTheme.secondary }]}
            >
              Are you sure you want to delete your account?
            </Text>

            <View style={modalStyles.buttons}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={modalStyles.cancelBtn}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowDeleteModal(false);
                  handleDelete();
                }}
                style={[
                  modalStyles.deleteBtn,
                  { backgroundColor: currentTheme.danger },
                ]}
              >
                <Text style={modalStyles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    columnGap: 12,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cancelText: {
    fontSize: 14,
    color: "#777",
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

