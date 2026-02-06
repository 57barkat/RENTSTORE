import React, { useEffect, useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { useRouter } from "expo-router";
import { FormContext, FormData } from "@/contextStore/FormContext";
import {
  useGetDraftPropertiesQuery,
  api,
  useFindDraftPropertyByIdAndDeleteMutation,
} from "@/services/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function DraftProperties() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const formContext = useContext(FormContext);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [ready, setReady] = useState(false); // Wait for token
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ✅ Load token and trigger query
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        // Optionally redirect to login
        console.log("No access token found");
        return;
      }
      setReady(true); // Now safe to call query
    };
    checkToken();
  }, []);

  // ✅ Query only when token is ready
  const { data, isLoading, isError, refetch } = useGetDraftPropertiesQuery();
  const [deleteProperty] = useFindDraftPropertyByIdAndDeleteMutation();
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  const handleEdit = (data: FormData) => {
    console.log("Editing draft:", data);
    formContext?.setFullFormData({ ...data });
    setTimeout(() => router.push("/upload/CreateStep"), 50);
  };

  const onDeleteConfirm = async () => {
    if (!selectedId) return;
    try {
      await deleteProperty(selectedId).unwrap();
      Toast.show({
        type: "success",
        text1: "Draft Deleted",
        text2: "Your draft has been removed.",
      });
      setShowDeleteModal(false);
      refetch();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: "Something went wrong.",
      });
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loaderContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ color: currentTheme.text, marginTop: 8 }}>
          Loading drafts...
        </Text>
      </View>
    );
  }

  if (isError || !data?.length) {
    return (
      <View
        style={[
          styles.loaderContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <Text style={{ color: currentTheme.text, fontSize: 16 }}>
          No draft properties found.
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
      <TouchableOpacity onPress={() => handleEdit(item)}>
        <Image
          source={{ uri: item.photos?.[0] }}
          style={[styles.image, { backgroundColor: currentTheme.border }]}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {item.title || "Untitled Property"}
          </Text>
          <Text style={[styles.subText, { color: currentTheme.muted }]}>
            {item.location || "No location"}
          </Text>
          <Text style={[styles.price, { color: currentTheme.primary }]}>{`$${
            item.monthlyRent || "N/A"
          }/month`}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.info }]}
          onPress={() => handleEdit(item)}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={20}
            color="#fff"
          />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.danger }]}
          onPress={() => {
            setSelectedId(item._id);
            setShowDeleteModal(true);
          }}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={20}
            color="#fff"
          />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <View
        style={[styles.container, { backgroundColor: currentTheme.background }]}
      >
        <Text style={[styles.header, { color: currentTheme.text }]}>
          Your Drafts
        </Text>
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 80,
            backgroundColor: currentTheme.background,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[currentTheme.primary]}
              tintColor={currentTheme.primary}
            />
          }
        />

        <Modal transparent visible={showDeleteModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalBox, { backgroundColor: currentTheme.card }]}
            >
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Confirm Deletion
              </Text>
              <Text style={[styles.modalText, { color: currentTheme.muted }]}>
                Are you sure you want to delete this draft?
              </Text>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    { backgroundColor: currentTheme.border },
                  ]}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={{ color: currentTheme.text }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    { backgroundColor: currentTheme.danger },
                  ]}
                  onPress={onDeleteConfirm}
                >
                  <Text style={{ color: "#fff" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Toast />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
  },
  image: { width: "100%", height: 160 },
  info: { padding: 10 },
  title: { fontSize: 18, fontWeight: "600" },
  subText: { fontSize: 14, marginVertical: 2 },
  price: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: { width: "80%", padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  modalText: { fontSize: 14, marginBottom: 20 },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
});
