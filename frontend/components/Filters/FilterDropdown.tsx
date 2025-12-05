import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { FilterOption } from "@/utils/homeTabUtils/filterUtils";

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues?: (string | number)[];
  multiSelect?: boolean;
  onSelect: (
    value: string | number,
    selectedValues?: (string | number)[]
  ) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedValues = [],
  multiSelect = false,
  onSelect,
}) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const [visible, setVisible] = useState(false);

  const handleSelect = (value: string | number) => {
    if (multiSelect) {
      const updated = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      onSelect(value, updated);
    } else {
      onSelect(value);
      setVisible(false);
    }
  };

  return (
    <View style={{ marginRight: 10 }}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: currentTheme.card }]}
        onPress={() => setVisible(true)}
      >
        <Text
          style={{
            color: selectedValues.length
              ? currentTheme.text
              : currentTheme.muted,
          }}
        >
          {multiSelect
            ? selectedValues.length
              ? `${selectedValues.length} selected`
              : label
            : selectedValues[0] || label}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={currentTheme.muted}
        />
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <ScrollView
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.card },
            ]}
          >
            {options.map((item) => (
              <TouchableOpacity
                key={item.value.toString()}
                style={styles.optionItem}
                onPress={() => handleSelect(item.value)}
              >
                <Text style={{ color: currentTheme.text }}>{item.label}</Text>
                {multiSelect && selectedValues.includes(item.value) && (
                  <Text style={{ color: currentTheme.primary }}> ✔</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 10,
    maxHeight: 350,
    paddingVertical: 8,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
