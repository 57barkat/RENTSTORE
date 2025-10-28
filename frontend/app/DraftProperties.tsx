import React, { useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { useRouter } from "expo-router";
import { FormContext, FormData } from "@/contextStore/FormContext";
import {
  useGetDraftPropertiesQuery,
  useFindPropertyByIdAndDeleteMutation,
} from "@/services/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function DraftProperties() {
  const { theme } = useTheme();
  const formContext = useContext(FormContext);
  const currentTheme = Colors[theme ?? "light"];
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useGetDraftPropertiesQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [deleteProperty] = useFindPropertyByIdAndDeleteMutation();

  useEffect(() => {
    refetch();
  }, []);

  const handleEdit = (data: FormData) => {
    console.log("coming from draft page", data);
    formContext?.setFullFormData({ ...data });

    // TEMPORARY: Add a small delay for state update to process
    setTimeout(() => {
      router.push("/upload/IntroStep1");
    }, 50); // 50ms should be plenty for the state update
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id).unwrap();
      Alert.alert("Deleted!", "Draft property has been removed.");
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
      Alert.alert("Error", "Failed to delete draft.");
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
          <Text style={[styles.buttonText]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.danger }]}
          onPress={() =>
            Alert.alert(
              "Confirm Deletion",
              "Are you sure you want to delete this draft?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDelete(item._id),
                },
              ]
            )
          }
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={20}
            color="#fff"
          />
          <Text style={[styles.buttonText]}>Delete</Text>
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
        contentContainerStyle={{
          paddingBottom: 80,
          backgroundColor: currentTheme.background,
        }}
      />
    </View>
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
});
