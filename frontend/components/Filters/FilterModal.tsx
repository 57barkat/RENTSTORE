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
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: theme.text,
            marginBottom: 16,
          }}
        >
          Filters
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <HostPicker
            title="Host Type"
            value={hostOption}
            onChange={onHostChange}
            theme={theme}
          />

          {/* City */}
          <Text style={{ color: theme.text, marginTop: 10 }}>City</Text>
          <TextInput
            style={[
              styles.modalInput,
              { borderColor: theme.border, color: theme.text },
            ]}
            placeholder="City"
            placeholderTextColor={theme.muted}
            value={filters.city || ""}
            onChangeText={(txt) => setFilters({ ...filters, city: txt })}
          />

          {/* Min Rent */}
          <Text style={{ color: theme.text, marginTop: 12 }}>Min Rent</Text>
          <TextInput
            style={[
              styles.modalInput,
              { borderColor: theme.border, color: theme.text },
            ]}
            keyboardType="numeric"
            placeholder="Min Rent"
            placeholderTextColor={theme.muted}
            value={filters.minRent?.toString() || ""}
            onChangeText={(txt) =>
              setFilters({
                ...filters,
                minRent: txt ? parseInt(txt) : undefined,
              })
            }
          />

          {/* Max Rent */}
          <Text style={{ color: theme.text, marginTop: 12 }}>Max Rent</Text>
          <TextInput
            style={[
              styles.modalInput,
              { borderColor: theme.border, color: theme.text },
            ]}
            keyboardType="numeric"
            placeholder="Max Rent"
            placeholderTextColor={theme.muted}
            value={filters.maxRent?.toString() || ""}
            onChangeText={(txt) =>
              setFilters({
                ...filters,
                maxRent: txt ? parseInt(txt) : undefined,
              })
            }
          />

          {/* Beds */}
          <Text style={{ color: theme.text, marginTop: 12 }}>Beds</Text>
          <TextInput
            style={[
              styles.modalInput,
              { borderColor: theme.border, color: theme.text },
            ]}
            keyboardType="numeric"
            placeholder="Beds"
            placeholderTextColor={theme.muted}
            value={filters.beds?.toString() || ""}
            onChangeText={(txt) =>
              setFilters({
                ...filters,
                beds: txt ? parseInt(txt) : undefined,
              })
            }
          />
        </ScrollView>

        {/* Buttons */}
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeBtn,
              { borderColor: theme.border, backgroundColor: theme.card },
            ]}
          >
            <Text style={{ color: theme.text }}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onApply}
            style={[styles.applyBtn, { backgroundColor: theme.secondary }]}
          >
            <Text style={{ color: "#fff" }}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  closeBtn: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  applyBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});
