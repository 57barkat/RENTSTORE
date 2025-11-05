import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { useRouter } from "expo-router";
import { FormContext, FormData } from "@/contextStore/FormContext";
import {
  useGetDraftPropertiesQuery,
  useFindPropertyByIdAndDeleteMutation,
} from "@/services/api";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import ConfirmationModal from "@/components/ConfirmDialog";

export default function DraftProperties() {
  const { theme } = useTheme();
  const formContext = useContext(FormContext);
  const currentTheme = Colors[theme ?? "light"];
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { data, isLoading, isError, refetch } = useGetDraftPropertiesQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );
  const [deleteProperty] = useFindPropertyByIdAndDeleteMutation();

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    refetch();
  }, []);

  const handleEdit = (data: FormData) => {
    formContext?.setFullFormData({ ...data });
    setTimeout(() => router.push("/upload/CreateStep"), 50);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await deleteProperty(id).unwrap();
      await refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
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
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={{ color: currentTheme.text, fontSize: 16 }}>
          No draft properties found.
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.card,
        { backgroundColor: currentTheme.card, width: width - 32 },
      ]}
    >
      <TouchableOpacity onPress={() => handleEdit(item)}>
        {item.photos?.[0] ? (
          <Image
            source={{ uri: item.photos[0] }}
            style={[styles.image, { backgroundColor: currentTheme.border }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.image,
              {
                backgroundColor: currentTheme.border,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="image-off-outline"
              size={40}
              color={currentTheme.muted}
            />
          </View>
        )}
        <View style={styles.info}>
          <Text
            style={[styles.title, { color: currentTheme.text }]}
            numberOfLines={1}
          >
            {item.title || "Untitled Property"}
          </Text>
          <View style={styles.row}>
            <Feather name="map-pin" size={14} color={currentTheme.muted} />
            <Text
              style={[styles.subText, { color: currentTheme.muted }]}
              numberOfLines={1}
            >
              {item.location || "No location"}
            </Text>
          </View>
          <Text style={[styles.price, { color: currentTheme.primary }]}>
            ${item.monthlyRent || "N/A"}/month
          </Text>
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
            setShowConfirm(true);
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
        contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 16 }}
      />

      <ConfirmationModal
        visible={showConfirm}
        title="Confirm Deletion"
        message="Are you sure you want to delete this draft?"
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          if (selectedId) await handleDelete(selectedId);
          setShowConfirm(false);
        }}
        cancelText="Cancel"
        confirmText={deleting ? "Deleting..." : "Delete"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 2,
  },
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
});
