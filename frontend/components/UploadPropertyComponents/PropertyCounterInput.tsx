import { stepperStyles } from "@/styles/PropertyDetails";
import { CounterInputProps } from "@/types/PropertyDetails.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FC } from "react";
import { Text, View, TouchableOpacity } from "react-native";

export const CounterInput: FC<CounterInputProps> = ({
  label,
  value,
  minValue,
  onIncrement,
  onDecrement,
}) => (
  <View style={stepperStyles.row}>
    <Text style={stepperStyles.label}>{label}</Text>
    <View style={stepperStyles.controls}>
      <TouchableOpacity
        onPress={onDecrement}
        disabled={value <= minValue}
        style={[
          stepperStyles.button,
          value <= minValue && stepperStyles.buttonDisabled,
        ]}
      >
        <MaterialCommunityIcons
          name="minus"
          size={24}
          color={value <= minValue ? "#ccc" : "#000"}
        />
      </TouchableOpacity>

      <Text style={stepperStyles.value}>{value}</Text>

      <TouchableOpacity onPress={onIncrement} style={stepperStyles.button}>
        <MaterialCommunityIcons name="plus" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  </View>
);
