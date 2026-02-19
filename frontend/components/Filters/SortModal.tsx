import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Platform,
  StyleSheet,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  options: { label: string; value: string; icon: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  theme: any;
}

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  options,
  selectedValue,
  onSelect,
  theme,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View
          style={[styles.sortModalContent, { backgroundColor: theme.card }]}
        >
          <View style={styles.modalHandle} />
          <Text style={[styles.sortModalTitle, { color: theme.text }]}>
            Sort Properties
          </Text>

          {options.map((option) => {
            const selected = option.value === selectedValue;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOptionItem,
                  selected && { backgroundColor: theme.secondary + "10" },
                ]}
                onPress={() => onSelect(option.value)}
              >
                <FontAwesome5
                  name={option.icon}
                  size={16}
                  color={selected ? theme.secondary : theme.text + "80"}
                />
                <Text
                  style={[
                    styles.sortOptionLabel,
                    { color: selected ? theme.secondary : theme.text },
                  ]}
                >
                  {option.label}
                </Text>
                {selected && (
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={theme.secondary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sortModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sortOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sortOptionLabel: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: "500" },
});
