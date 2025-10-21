import { styles } from "@/styles/FinalAddressDetailsScreen";
import { FC } from "react";
import { Text, TextInput, View } from "react-native";

export const InputField: FC<{
  label: string;
  value: string;
  placeholder?: string;
  onChange: (text: string) => void;
}> = ({ label, value, placeholder, onChange }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      style={styles.textInput}
    />
  </View>
);
