import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { HostPicker } from "./HostPicker";

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  hostOption: string;
  onHostChange: (v: string) => void;
  filters: {
    city?: string;
    minRent?: number;
    maxRent?: number;
    beds?: number;
    bathrooms?: number; // Added
  };
  setFilters: (v: any) => void;
  theme: any;
}

export const FilterModal: React.FC<Props> = ({
  visible,
  onClose,
  onApply,
  hostOption,
  onHostChange,
  filters,
  setFilters,
  theme,
}) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: theme.text,
            marginBottom: 20,
          }}
        >
          Filter Properties
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <HostPicker
            title="I am looking for..."
            value={hostOption}
            onChange={onHostChange}
            theme={theme}
          />

          <Text style={[styles.label, { color: theme.text }]}>City</Text>
          <TextInput
            style={[
              styles.modalInput,
              { borderColor: theme.border, color: theme.text },
            ]}
            placeholder="e.g. Rawalpindi"
            placeholderTextColor={theme.muted}
            value={filters.city || ""}
            onChangeText={(txt) => setFilters({ ...filters, city: txt })}
          />

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.label, { color: theme.text }]}>
                Min Rent
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { borderColor: theme.border, color: theme.text },
                ]}
                keyboardType="numeric"
                value={filters.minRent?.toString() || ""}
                onChangeText={(txt) =>
                  setFilters({
                    ...filters,
                    minRent: txt ? parseInt(txt) : undefined,
                  })
                }
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.label, { color: theme.text }]}>
                Max Rent
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { borderColor: theme.border, color: theme.text },
                ]}
                keyboardType="numeric"
                value={filters.maxRent?.toString() || ""}
                onChangeText={(txt) =>
                  setFilters({
                    ...filters,
                    maxRent: txt ? parseInt(txt) : undefined,
                  })
                }
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.label, { color: theme.text }]}>
                Bedrooms
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { borderColor: theme.border, color: theme.text },
                ]}
                keyboardType="numeric"
                placeholder="0"
                value={filters.beds?.toString() || ""}
                onChangeText={(txt) =>
                  setFilters({
                    ...filters,
                    beds: txt ? parseInt(txt) : undefined,
                  })
                }
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.label, { color: theme.text }]}>
                Bathrooms
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { borderColor: theme.border, color: theme.text },
                ]}
                keyboardType="numeric"
                placeholder="0"
                value={filters.bathrooms?.toString() || ""}
                onChangeText={(txt) =>
                  setFilters({
                    ...filters,
                    bathrooms: txt ? parseInt(txt) : undefined,
                  })
                }
              />
            </View>
          </View>
        </ScrollView>

        <View
          style={{ flexDirection: "row", marginTop: 20, paddingBottom: 20 }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeBtn,
              { borderColor: theme.border, backgroundColor: theme.card },
            ]}
          >
            <Text style={{ color: theme.text, fontWeight: "600" }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onApply}
            style={[styles.applyBtn, { backgroundColor: theme.secondary }]}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  label: { marginTop: 15, fontWeight: "600", fontSize: 14 },
  modalInput: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    marginTop: 6,
    fontSize: 16,
  },
  closeBtn: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10,
  },
  applyBtn: { flex: 2, padding: 16, borderRadius: 12, alignItems: "center" },
});
