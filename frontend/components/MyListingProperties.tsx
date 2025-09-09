import {
  useFindMyPropertiesQuery,
  useFindPropertyByIdAndDeleteMutation,
} from "@/services/api";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";

const MyListingProperties = () => {
  const {
    data: myProperties,
    isLoading,
    error,
    refetch,
  } = useFindMyPropertiesQuery();

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { width } = useWindowDimensions();

  const handleOpenDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/property/edit/${id}`);
  };

  const [deleteProperty] = useFindPropertyByIdAndDeleteMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id).unwrap();
      Alert.alert("Deleted!", "Property has been removed.");
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
      Alert.alert("Error", "Failed to delete property.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ marginTop: 8, color: currentTheme.text }}>
          Loading properties...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: currentTheme.error }}>Failed to load properties.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, padding: 8, backgroundColor: currentTheme.background }}
      data={myProperties ?? []}
      keyExtractor={(item, index) => item._id ?? index.toString()}
      ListHeaderComponent={
        <View>
          <Text style={[styles.header, { color: currentTheme.text }]}>
            My Listing Properties
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            { backgroundColor: currentTheme.card, width: width * 0.95 },
          ]}
        >
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.location, { color: currentTheme.muted }]}>
            📍 {item.city} | {item.address}
          </Text>
          <Text style={[styles.price, { color: currentTheme.primary }]}>
            💰 Rs. {item.rentPrice.toLocaleString()}
          </Text>

          {/* Buttons Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.success }]}
              onPress={() => handleOpenDetails(item._id)}
            >
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.info }]}
              onPress={() => handleEdit(item._id)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.danger }]}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    padding: 14,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  location: {
    marginBottom: 2,
  },
  price: {
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default MyListingProperties;
