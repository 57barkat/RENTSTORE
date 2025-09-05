import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";
import { useNavigation } from "@react-navigation/native";

export default function Profile() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const navigation = useNavigation();

  // Dummy data for FlatList (since MyListingProperties is rendered inside header)
  const data = [{ key: "dummy" }];

  return (
    <FlatList
      data={data}
      renderItem={null}
      keyExtractor={(item) => item.key}
      style={{ flex: 1, backgroundColor: currentTheme.background }}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <>
          {/* Profile Header */}
          <View style={styles.header}>
            <Image
              source={{ uri: "https://via.placeholder.com/100" }}
              style={styles.avatar}
            />
            <Text style={[styles.name, { color: currentTheme.text }]}>
              John Doe
            </Text>
            <Text style={[styles.email, { color: currentTheme.muted }]}>
              johndoe@example.com
            </Text>
          </View>
          {/* My Listings Button */}
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
          </View>
        </>
      }
      ListFooterComponent={
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: currentTheme.primary },
          ]}
        >
          <Text style={styles.logoutText}>Delete my account</Text>
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
