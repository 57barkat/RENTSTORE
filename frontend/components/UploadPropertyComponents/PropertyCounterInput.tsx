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
  textColor = "#000",      
  buttonColor = "#000",      
}) => (
  <View style={stepperStyles.row}>
    <Text style={[stepperStyles.label, { color: textColor }]}>{label}</Text>
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
          color={value <= minValue ? "#ccc" : buttonColor}
        />
      </TouchableOpacity>

      <Text style={[stepperStyles.value, { color: textColor }]}>{value}</Text>

      <TouchableOpacity onPress={onIncrement} style={stepperStyles.button}>
        <MaterialCommunityIcons name="plus" size={24} color={buttonColor} />
      </TouchableOpacity>
    </View>
  </View>
);

