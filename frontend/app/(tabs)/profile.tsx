import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";

export default function Profile() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: currentTheme.background },
      ]}
    >
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

      {/* My Listings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          My Listings
        </Text>
        <Text style={[styles.placeholder, { color: currentTheme.muted }]}>
          No properties uploaded yet.
        </Text>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          { backgroundColor: currentTheme.primary },
        ]}
      >
        <Text style={styles.logoutText}>Delete my account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 , height: '100%'},
  header: { alignItems: "center", marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: "bold" },
  email: { fontSize: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  placeholder: { fontSize: 14 },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "600" },
});
