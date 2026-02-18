import React, { useContext, useState, useCallback } from "react";
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
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { useRouter } from "expo-router";
import { FormContext, FormData } from "@/contextStore/FormContext";
import {
  useGetDraftPropertiesQuery,
  useFindDraftPropertyByIdAndDeleteMutation,
} from "@/services/api";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function DraftProperties() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const formContext = useContext(FormContext);
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // RTK Query for fetching drafts
  const {
    data: drafts,
    isLoading,
    isError,
    refetch,
  } = useGetDraftPropertiesQuery();

  console.log(
    "Draft Properties Data:",
    drafts,
    "Loading:",
    isLoading,
    "Error:",
    isError,
  );

  const [deleteProperty] = useFindDraftPropertyByIdAndDeleteMutation();

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch failed", e);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Edit draft
  const handleEdit = (data: FormData) => {
    formContext?.setFullFormData({ ...data });
    setTimeout(() => router.push("/upload/CreateStep"), 50);
  };

  // Delete draft
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
      refetch(); // Refresh the list after delete
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: "Something went wrong.",
      });
      console.error(err);
    }
  };

  // Loader
  if (isLoading && !refreshing) {
    return (
      <View
        style={[
          styles.loaderContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text
          style={{ color: currentTheme.text, marginTop: 12, fontWeight: "500" }}
        >
          Loading your drafts...
        </Text>
      </View>
    );
  }

  // Render each draft
  const renderItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.border,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleEdit(item)}
        style={styles.cardPressable}
      >
        <Image
          source={
            item.photos?.[0]
              ? { uri: item.photos[0] }
              : { uri: "https://via.placeholder.com/300?text=No+Image" }
          }
          style={[styles.image, { backgroundColor: currentTheme.border }]}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text
            style={[styles.title, { color: currentTheme.text }]}
            numberOfLines={1}
          >
            {item.title || "Untitled Property"}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={currentTheme.muted}
            />
            <Text
              style={[styles.subText, { color: currentTheme.muted }]}
              numberOfLines={1}
            >
              {item.location || "No location set"}
            </Text>
          </View>
          <Text style={[styles.price, { color: currentTheme.primary }]}>
            Rs. {item.monthlyRent?.toLocaleString() || "0"}
            <Text style={styles.pricePeriod}>/month</Text>
          </Text>
        </View>
      </TouchableOpacity>

      <View
        style={[styles.actionsRow, { borderTopColor: currentTheme.border }]}
      >
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={18}
            color={currentTheme.primary}
          />
          <Text
            style={[styles.actionButtonText, { color: currentTheme.primary }]}
          >
            Continue
          </Text>
        </TouchableOpacity>

        <View
          style={[styles.divider, { backgroundColor: currentTheme.border }]}
        />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedId(item._id);
            setShowDeleteModal(true);
          }}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color={currentTheme.danger}
          />
          <Text
            style={[styles.actionButtonText, { color: currentTheme.danger }]}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          Drafts
        </Text>
      </View>

      {/* Drafts List */}
      <FlatList
        data={drafts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={currentTheme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={80}
              color={currentTheme.muted + "40"}
            />
            <Text style={[styles.emptyText, { color: currentTheme.text }]}>
              No draft properties
            </Text>
            <Text style={[styles.emptySubText, { color: currentTheme.muted }]}>
              Your unfinished property listings will appear here.
            </Text>
          </View>
        }
      />

      {/* Delete Modal */}
      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalBox, { backgroundColor: currentTheme.card }]}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Delete Draft?
            </Text>
            <Text style={[styles.modalText, { color: currentTheme.muted }]}>
              This action cannot be undone.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: currentTheme.border + "40" },
                ]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={{ color: currentTheme.text, fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: currentTheme.danger },
                ]}
                onPress={onDeleteConfirm}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardPressable: { flexDirection: "row", padding: 12, gap: 12 },
  image: { width: 100, height: 100, borderRadius: 12 },
  info: { flex: 1, justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  subText: { fontSize: 13, flex: 1 },
  price: { fontSize: 16, fontWeight: "800" },
  pricePeriod: { fontSize: 12, fontWeight: "400" },
  actionsRow: { flexDirection: "row", borderTopWidth: 1, height: 44 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonText: { fontSize: 13, fontWeight: "700" },
  divider: { width: 1, height: "100%" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: { fontSize: 18, fontWeight: "700", marginTop: 16 },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: { width: "85%", padding: 24, borderRadius: 20 },
  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: { fontSize: 15, marginBottom: 24, textAlign: "center" },
  modalButtonsRow: { flexDirection: "row", gap: 12 },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
