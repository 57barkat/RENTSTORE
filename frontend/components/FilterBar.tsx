import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";

interface FilterBarProps {
  filters: {
    beds: number | null;
    propertyType: string;
    minRent: number;
    maxRent: number;
    rentType: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  onApply: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  onApply,
}) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const [visible, setVisible] = useState(false);

  // Local state for multi-slider
  const [localRent, setLocalRent] = useState<[number, number]>([
    filters.minRent,
    filters.maxRent,
  ]);

  useEffect(() => {
    setLocalRent([filters.minRent, filters.maxRent]);
  }, [filters.minRent, filters.maxRent]);

  const handleApply = () => {
    setFilters({ ...filters, minRent: localRent[0], maxRent: localRent[1] });
    onApply();
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.openButton, { backgroundColor: currentTheme.primary }]}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Show All Filters
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.card },
            ]}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Filter Properties
            </Text>

            {/* Beds */}
            <View style={styles.optionRow}>
              <Text style={{ color: currentTheme.text }}>Beds:</Text>
              <View style={styles.optionButtons}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor:
                          filters.beds === b
                            ? currentTheme.primary
                            : currentTheme.muted,
                      },
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        beds: filters.beds === b ? null : b,
                      })
                    }
                  >
                    <Text style={{ color: "#fff" }}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Property Type */}
            <View style={styles.optionRow}>
              <Text style={{ color: currentTheme.text }}>Property Type:</Text>
              <View style={styles.optionButtons}>
                {["house", "apartment", "hostel", "room"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor:
                          filters.propertyType === type
                            ? currentTheme.primary
                            : currentTheme.muted,
                      },
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, propertyType: type })
                    }
                  >
                    <Text
                      style={{ color: "#fff", textTransform: "capitalize" }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.optionRow}>
              <Text style={{ color: currentTheme.text }}>Rent Type:</Text>
              <View style={styles.optionButtons}>
                {["daily", "weekly", "monthly"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor:
                          filters.rentType === type
                            ? currentTheme.primary
                            : currentTheme.muted,
                      },
                    ]}
                    onPress={() => setFilters({ ...filters, rentType: type })}
                  >
                    <Text
                      style={{ color: "#fff", textTransform: "capitalize" }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Rent Range */}
            <View style={{ marginVertical: 20 }}>
              <Text style={{ color: currentTheme.text, marginBottom: 10 }}>
                Rent Range: Rs {localRent[0].toLocaleString()} -{" "}
                {localRent[1].toLocaleString()}
              </Text>
              <MultiSlider
                values={localRent}
                min={0}
                max={1000000}
                step={500}
                onValuesChange={(vals) => setLocalRent([vals[0], vals[1]])}
                selectedStyle={{ backgroundColor: currentTheme.primary }}
                markerStyle={{ backgroundColor: currentTheme.primary }}
              />
            </View>

            {/* Apply / Close Buttons */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  { backgroundColor: currentTheme.primary },
                ]}
                onPress={handleApply}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  { backgroundColor: currentTheme.danger },
                ]}
                onPress={() => setVisible(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default FilterBar;

const styles = StyleSheet.create({
  openButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 25,
    alignSelf: "center",
    // marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: { marginHorizontal: 20, borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  optionRow: { marginBottom: 15 },
  optionButtons: { flexDirection: "row", marginTop: 10 },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  applyButton: {
    padding: 12,
    borderRadius: 25,
    flex: 0.45,
    alignItems: "center",
  },
});
