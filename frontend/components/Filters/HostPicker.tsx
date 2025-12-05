import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { hostOptions } from "../../utils/homeTabUtils/hostOptions";

interface Props {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  theme: any;
}

export const HostPicker: React.FC<Props> = ({
  value,
  onChange,
  title = "Host Type",
  theme,
}) => {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: theme.text, marginBottom: 6, fontSize: 14 }}>
        {title}
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
        }}
      >
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          dropdownIconColor={theme.text}
          style={{ color: theme.text }}
        >
          {hostOptions.map((opt) => (
            <Picker.Item
              key={opt.value}
              label={opt.label}
              value={opt.value}
              color={theme.text}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};
