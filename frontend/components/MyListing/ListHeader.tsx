import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { FontSize } from "@/constants/Typography";

const ListHeader = ({
  currentTheme,
  userCredits,
  search,
  setSearch,
  sort,
  setSort,
}: any): React.ReactNode => {
  const getSortLabel = (key: string) => {
    const labels: Record<string, string> = {
      priceLow: "Price: Low",
      priceHigh: "Price: High",
      pending: "Pending Approval",
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <Text style={[styles.header, { color: currentTheme.text }]}>
          My Listings
        </Text>
        <View
          style={[
            styles.creditBadge,
            { backgroundColor: currentTheme.secondary + "15" },
          ]}
        >
          <MaterialCommunityIcons
            name="star-circle"
            size={14}
            color={currentTheme.secondary}
          />
          <Text style={[styles.creditText, { color: currentTheme.secondary }]}>
            Credits: {userCredits || 0}
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={currentTheme.muted} />
        <TextInput
          placeholder="Search by title..."
          placeholderTextColor={currentTheme.muted}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: currentTheme.text }]}
        />
      </View>

      <View style={styles.sortRow}>
        {["newest", "oldest", "priceLow", "priceHigh", "pending"].map(
          (item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setSort(item)}
              style={[
                styles.sortButton,
                {
                  backgroundColor:
                    sort === item ? currentTheme.secondary : currentTheme.card,
                  borderColor:
                    sort === item
                      ? currentTheme.secondary
                      : currentTheme.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Text
                style={{
                  color: sort === item ? "#fff" : currentTheme.text,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                {getSortLabel(item)}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: { paddingTop: 20, paddingBottom: 15 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  header: { fontSize: FontSize.xl, fontWeight: "900" },
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  creditText: { fontSize: 11, fontWeight: "800" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: FontSize.sm,
  },
  sortRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  sortButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
});

export default ListHeader;
