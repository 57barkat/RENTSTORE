import { styles } from "@/styles/FinalAddressDetailsScreen";
import { FC } from "react";
import { Text, TextInput, View } from "react-native";

interface InputFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (text: string) => void;
  themeColors?: any;
  error?: string;
  isInvalid?: boolean;
}

export const InputField: FC<InputFieldProps> = ({
  label,
  value,
  placeholder,
  onChange,
  themeColors,
  error,
  isInvalid = false,
}) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, { color: themeColors?.text ?? "#000" }]}>
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={themeColors?.placeholder ?? "#000000"}
      style={[
        styles.textInput,
        {
          color: themeColors?.text ?? "#000",
          borderColor: isInvalid ? "#dc2626" : "#ccc",
        },
      ]}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);
