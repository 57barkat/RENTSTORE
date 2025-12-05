import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

type ChipKey = "city" | "minRent" | "maxRent" | "beds" | "hostOption";

interface Props {
  chips: { key: ChipKey; label: string; removable: boolean }[];
  onRemove: (key: ChipKey) => void;
  onOpenModal: () => void;
  theme: any;
}

export const FilterChips: React.FC<Props> = ({
  chips,
  onRemove,
  onOpenModal,
  theme,
}) => {
  return (
    <View style={styles.chipsContainer}>
      {chips.map((chip) => (
        <View
          key={chip.key}
          style={[
            styles.chip,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={{ color: theme.text }}>{chip.label}</Text>

          {chip.removable && (
            <TouchableOpacity onPress={() => onRemove(chip.key)}>
              <Feather name="x" size={16} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Filter Button */}
      <TouchableOpacity
        onPress={onOpenModal}
        style={[
          styles.filterIconBtn,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Feather name="sliders" size={20} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterIconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
});
