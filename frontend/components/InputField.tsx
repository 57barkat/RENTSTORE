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
  <View>
    <View style={[styles.container, { backgroundColor }]}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
      {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
    </View>
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconWrap: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, fontWeight: "500" },
  error: { color: "#EF4444", fontSize: 12, marginLeft: 5, marginTop: 4 },
  rightIconContainer: { marginLeft: 10 },
});
