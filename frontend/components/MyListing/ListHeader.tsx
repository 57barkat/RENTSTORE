import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { FontSize } from "@/constants/Typography";
import { hostOptions } from "@/utils/homeTabUtils/hostOptions";

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price: Low to high", value: "priceLow" },
  { label: "Price: High to low", value: "priceHigh" },
  { label: "Pending approval", value: "pending" },
];

const LIFECYCLE_OPTIONS = [
  { label: "All listings", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
];

const ListHeader = ({
  currentTheme,
  user,
  search,
  setSearch,
  sort,
  setSort,
  filters,
  setFilters,
}: any): React.ReactNode => {
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    type: "boost" | "featured" | null;
  }>({ visible: false, type: null });
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);

  const showInfo = (type: "boost" | "featured") => {
    setInfoModal({ visible: true, type });
  };

  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.hostOption && filters.hostOption !== "all") count += 1;
    if (filters.lifecycle && filters.lifecycle !== "all") count += 1;
    if (filters.minRent) count += 1;
    if (filters.maxRent) count += 1;
    if (sort && sort !== "newest") count += 1;
    return count;
  }, [filters.hostOption, filters.lifecycle, filters.maxRent, filters.minRent, sort]);

  const resetFilters = () => {
    setFilters({
      hostOption: "all",
      lifecycle: "all",
      minRent: "",
      maxRent: "",
    });
    setSort("newest");
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
          placeholder="Search by title or address..."
          placeholderTextColor={currentTheme.muted}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: currentTheme.text }]}
        />
      </View>

      <View style={styles.toolbarRow}>
        <TouchableOpacity
          onPress={() => setFiltersModalVisible(true)}
          style={[
            styles.toolbarButton,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={18}
            color={currentTheme.text}
          />
          <Text style={[styles.toolbarButtonText, { color: currentTheme.text }]}>
            Filter & Sort
          </Text>
          {appliedFiltersCount > 0 ? (
            <View
              style={[
                styles.countBadge,
                { backgroundColor: currentTheme.secondary },
              ]}
            >
              <Text style={styles.countBadgeText}>{appliedFiltersCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetFilters}
          style={[
            styles.toolbarButton,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <Feather name="rotate-ccw" size={16} color={currentTheme.text} />
          <Text style={[styles.toolbarButtonText, { color: currentTheme.text }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={filtersModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFiltersModalVisible(false)}
        >
          <Pressable
            style={[styles.filtersBox, { backgroundColor: currentTheme.card }]}
            onPress={() => {}}
          >
            <View style={styles.filtersHeader}>
              <Text style={[styles.filtersTitle, { color: currentTheme.text }]}>
                Filter Listings
              </Text>
              <TouchableOpacity onPress={() => setFiltersModalVisible(false)}>
                <Feather name="x" size={22} color={currentTheme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
            >
              <View>
                <Text style={[styles.sectionLabel, { color: currentTheme.muted }]}>
                  Property Type
                </Text>
                <View style={styles.optionWrap}>
                  <TouchableOpacity
                    onPress={() =>
                      setFilters((prev: any) => ({ ...prev, hostOption: "all" }))
                    }
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor:
                          filters.hostOption === "all"
                            ? currentTheme.secondary
                            : currentTheme.background,
                        borderColor:
                          filters.hostOption === "all"
                            ? currentTheme.secondary
                            : currentTheme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          filters.hostOption === "all" ? "#fff" : currentTheme.text,
                        fontWeight: "700",
                      }}
                    >
                      All Types
                    </Text>
                  </TouchableOpacity>

                  {hostOptions.map((option) => {
                    const selected = filters.hostOption === option.value;

                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() =>
                          setFilters((prev: any) => ({
                            ...prev,
                            hostOption: option.value,
                          }))
                        }
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: selected
                              ? currentTheme.secondary
                              : currentTheme.background,
                            borderColor: selected
                              ? currentTheme.secondary
                              : currentTheme.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: selected ? "#fff" : currentTheme.text,
                            fontWeight: "700",
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={[styles.sectionLabel, { color: currentTheme.muted }]}>
                  Listing Status
                </Text>
                <View style={styles.optionWrap}>
                  {LIFECYCLE_OPTIONS.map((option) => {
                    const selected = filters.lifecycle === option.value;

                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() =>
                          setFilters((prev: any) => ({
                            ...prev,
                            lifecycle: option.value,
                          }))
                        }
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: selected
                              ? currentTheme.secondary
                              : currentTheme.background,
                            borderColor: selected
                              ? currentTheme.secondary
                              : currentTheme.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: selected ? "#fff" : currentTheme.text,
                            fontWeight: "700",
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={[styles.sectionLabel, { color: currentTheme.muted }]}>
                  Price Range
                </Text>
                <View style={styles.rentRow}>
                  <View
                    style={[
                      styles.rentInputWrap,
                      {
                        backgroundColor: currentTheme.background,
                        borderColor: currentTheme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.rentPrefix, { color: currentTheme.muted }]}
                    >
                      Min Rs
                    </Text>
                    <TextInput
                      value={filters.minRent}
                      onChangeText={(value) =>
                        setFilters((prev: any) => ({ ...prev, minRent: value }))
                      }
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={currentTheme.muted}
                      style={[styles.rentInput, { color: currentTheme.text }]}
                    />
                  </View>
                  <View
                    style={[
                      styles.rentInputWrap,
                      {
                        backgroundColor: currentTheme.background,
                        borderColor: currentTheme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.rentPrefix, { color: currentTheme.muted }]}
                    >
                      Max Rs
                    </Text>
                    <TextInput
                      value={filters.maxRent}
                      onChangeText={(value) =>
                        setFilters((prev: any) => ({ ...prev, maxRent: value }))
                      }
                      keyboardType="numeric"
                      placeholder="Any"
                      placeholderTextColor={currentTheme.muted}
                      style={[styles.rentInput, { color: currentTheme.text }]}
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text style={[styles.sectionLabel, { color: currentTheme.muted }]}>
                  Sort By
                </Text>
                <View style={styles.optionWrap}>
                  {SORT_OPTIONS.map((option) => {
                    const selected = sort === option.value;

                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setSort(option.value)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: selected
                              ? currentTheme.secondary
                              : currentTheme.background,
                            borderColor: selected
                              ? currentTheme.secondary
                              : currentTheme.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: selected ? "#fff" : currentTheme.text,
                            fontWeight: "700",
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={resetFilters}
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.border,
                  },
                ]}
              >
                <Text
                  style={[styles.secondaryButtonText, { color: currentTheme.text }]}
                >
                  Reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFiltersModalVisible(false)}
                style={[
                  styles.primaryButton,
                  { backgroundColor: currentTheme.secondary },
                ]}
              >
                <Text style={styles.primaryButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={infoModal.visible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setInfoModal({ visible: false, type: null })}
        >
          <View style={[styles.infoBox, { backgroundColor: currentTheme.card }]}>
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
  toolbarRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  toolbarButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  filtersBox: {
    width: "100%",
    maxHeight: "82%",
    borderRadius: 24,
    padding: 22,
  },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  filtersContent: {
    gap: 18,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 20,
  },
  rentRow: {
    flexDirection: "row",
    gap: 10,
  },
  rentInputWrap: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rentPrefix: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  rentInput: {
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 0,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
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
