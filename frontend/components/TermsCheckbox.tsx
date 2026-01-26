import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Checkbox } from "react-native-paper";

export const TermsCheckbox = ({
  acceptedTerms,
  setAcceptedTerms,
  onPressTerms,
  textColor,
}: any) => (
  <TouchableOpacity
    style={{ flexDirection: "row", alignItems: "center", marginTop: 15 }}
    onPress={() => setAcceptedTerms(!acceptedTerms)}
  >
    <Checkbox
      status={acceptedTerms ? "checked" : "unchecked"}
      onPress={() => setAcceptedTerms(!acceptedTerms)}
      color="#3B82F6"
    />
    <Text style={{ fontSize: 14, flex: 1, marginLeft: 8, color: textColor }}>
      I accept the{" "}
      <Text
        style={{ color: "#3B82F6", textDecorationLine: "underline" }}
        onPress={onPressTerms}
      >
        Terms and Conditions
      </Text>
    </Text>
  </TouchableOpacity>
);
