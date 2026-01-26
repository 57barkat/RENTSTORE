import React, { JSX } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

interface Props {
  icon?: JSX.Element;
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
  onBlur?: () => void;
  error?: string | false;
  secureTextEntry?: boolean;
  keyboardType?: any;
  backgroundColor?: string;
  rightIcon?: React.ReactNode;
  textColor?: string;
}

export const InputField: React.FC<Props> = ({
  icon,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  secureTextEntry,
  keyboardType,
  backgroundColor = "#fff",
  textColor = "#000",
  rightIcon,
}) => (
  <View style={[styles.container, { backgroundColor }]}>
    {icon && icon}
    <TextInput
      style={[styles.input, { color: textColor }]}
      placeholder={placeholder}
      placeholderTextColor="#A0AEC0"
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
    />
    {error && <Text style={styles.error}>{error}</Text>}
    {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 10,
    height: 55,
  },
  input: { flex: 1, fontSize: 16 },
  error: { color: "#EF4444", fontSize: 12, marginLeft: 5, marginTop: 2 },
  rightIconContainer: {
    marginLeft: 10,
  },
});
