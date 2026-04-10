import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { FontSize } from "@/constants/Typography";

const ListHeader = ({
  currentTheme,
  user,
  search,
  setSearch,
  sort,
  setSort,
}: any): React.ReactNode => {
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    type: "boost" | "featured" | null;
  }>({ visible: false, type: null });

  const getSortLabel = (key: string) => {
    const labels: Record<string, string> = {
      priceLow: "Price: Low",
      priceHigh: "Price: High",
      pending: "Pending Approval",
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const showInfo = (type: "boost" | "featured") => {
    setInfoModal({ visible: true, type });
  };

  return (
    <View style={styles.headerContainer}>
      <Text style={[styles.header, { color: currentTheme.text }]}>
        My Listings
      </Text>

      <View style={styles.benefitContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => showInfo("boost")}
          style={[
            styles.benefitCard,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#FFF9E6" }]}>
            <MaterialCommunityIcons
              name="rocket-launch"
              size={18}
              color="#FFB800"
            />
          </View>
          <View>
            <Text style={[styles.benefitValue, { color: currentTheme.text }]}>
              {user?.prioritySlotCredits || 0} Slots
            </Text>
            <Text style={styles.benefitLabel}>Boost (Top of list)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => showInfo("featured")}
          style={[
            styles.benefitCard,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#EEF2FF" }]}>
            <MaterialCommunityIcons name="crown" size={18} color="#4F46E5" />
          </View>
          <View>
            <Text style={[styles.benefitValue, { color: currentTheme.text }]}>
              {user?.paidFeaturedCredits || 0} Left
            </Text>
            <Text style={styles.benefitLabel}>Featured (Premium)</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
          },
        ]}
      >
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

      <Modal visible={infoModal.visible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setInfoModal({ visible: false, type: null })}
        >
          <View
            style={[styles.infoBox, { backgroundColor: currentTheme.card }]}
          >
            <MaterialCommunityIcons
              name={infoModal.type === "boost" ? "rocket-launch" : "crown"}
              size={50}
              color={infoModal.type === "boost" ? "#FFB800" : "#4F46E5"}
            />
            <Text style={[styles.infoTitle, { color: currentTheme.text }]}>
              {infoModal.type === "boost"
                ? "Priority Boost"
                : "Featured Listing"}
            </Text>
            <Text style={[styles.infoDesc, { color: currentTheme.secondary }]}>
              {infoModal.type === "boost"
                ? "Priority slots put your property at the very top of search results. Users see your listing first before anyone else's."
                : "Featured listings get a premium badge and are highlighted across the platform, resulting in up to 10x more inquiries."}
            </Text>
            <TouchableOpacity
              style={[
                styles.closeBtn,
                {
                  backgroundColor:
                    infoModal.type === "boost" ? "#FFB800" : "#4F46E5",
                },
              ]}
              onPress={() => setInfoModal({ visible: false, type: null })}
            >
              <Text style={styles.closeBtnText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: { paddingTop: 20, paddingBottom: 15 },
  header: { fontSize: FontSize.xl, fontWeight: "900", marginBottom: 20 },
  benefitContainer: { flexDirection: "row", gap: 12, marginBottom: 20 },
  benefitCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitValue: { fontSize: 14, fontWeight: "800" },
  benefitLabel: { fontSize: 10, color: "#6B7280", fontWeight: "600" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: FontSize.sm,
  },
  sortRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  sortButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  infoBox: {
    width: "100%",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 15,
    marginBottom: 10,
  },
  infoDesc: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 25,
  },
  closeBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default ListHeader;
