import { styles } from "@/styles/SafetyDetailsScreen";
import { CheckboxItemProps } from "@/types/SafetyDetailsScreen.types";
import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const CheckboxItem: FC<CheckboxItemProps> = ({
  detail,
  isChecked,
  onToggle,
  description,
  onEditDescription,
}) => (
  <View style={styles.checkboxItem}>
    <TouchableOpacity
      style={styles.checkboxRow}
      onPress={() => onToggle(detail.key)}
    >
      <Text style={styles.checkboxLabel}>{detail.label}</Text>
      <View
        style={[styles.checkboxBox, isChecked && styles.checkboxBoxChecked]}
      >
        {isChecked && <Text style={styles.checkboxCheck}>✓</Text>}
      </View>
    </TouchableOpacity>

    {detail.key === "exterior_camera" && isChecked && description && (
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{description}</Text>
        <TouchableOpacity style={styles.editButton} onPress={onEditDescription}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);
