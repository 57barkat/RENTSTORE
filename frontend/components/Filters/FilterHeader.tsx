import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { FilterChips } from "./FilterChips";

export const FilterHeader = ({
  selectedChips,
  filters,
  setFilters,
  showFilters,
  toggleFilterVisibility,
  openModal,
  openSort,
  sortBy,
  sortOptions,
  theme,
}: any) => {
  const handleClearAll = () => {
    setFilters({});
  };

  return (
    <View style={styles.filterSectionContainer}>
      <View style={styles.filterControls}>
        <Text style={{ color: theme.text + "80" }}>
          {selectedChips.length} active filters
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={openSort} style={styles.sortInlineTrigger}>
            <View
              style={[
                styles.verticalDivider,
                { backgroundColor: theme.border },
              ]}
            />
            <FontAwesome5
              name="sort-amount-down"
              size={12}
              color={theme.secondary}
            />
            <Text style={[styles.sortLabelText, { color: theme.secondary }]}>
              {sortOptions
                .find((o: any) => o.value === sortBy)
                ?.label.split(":")[0] || "Sort"}
            </Text>
          </TouchableOpacity>

          {selectedChips.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={styles.controlButton}
            >
              <Text style={{ color: theme.secondary, fontWeight: "700" }}>
                Clear All
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={toggleFilterVisibility}
            style={styles.controlButton}
          >
            <MaterialIcons
              name={showFilters ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color={theme.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <View style={styles.filterHeader}>
          <FilterChips
            chips={selectedChips}
            onRemove={(key) => setFilters({ ...filters, [key]: undefined })}
            onOpenModal={openModal}
            theme={theme}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterSectionContainer: {
    marginTop: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  filterControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 16,
    paddingBottom: 8,
  },
  controlButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  sortInlineTrigger: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  sortLabelText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  verticalDivider: {
    width: 1,
    height: 14,
    marginHorizontal: 6,
  },
});
