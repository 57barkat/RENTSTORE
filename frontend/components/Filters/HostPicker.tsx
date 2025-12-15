import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { hostOptions } from "../../utils/homeTabUtils/hostOptions";

interface Props {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  theme: any;
}

export const HostPicker: React.FC<Props> = ({ value, onChange, theme }) => {
  return (
    <View style={{ marginBottom: 14 }}>
      {/* <Text style={{ color: theme.text, marginBottom: 6, fontSize: 14 }}>
        {title}
      </Text> */}

      <View style={{ flexDirection: "row", gap: 10 }}>
        {hostOptions.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isSelected ? theme.primary : theme.border,
                backgroundColor: isSelected ? theme.primary : theme.card,
              }}
            >
              <Text
                style={{
                  color: isSelected ? theme.background : theme.text,
                  fontSize: 14,
                  fontWeight: isSelected ? "600" : "400",
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
