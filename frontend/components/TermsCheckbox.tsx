import React from "react";
import { View, Text } from "react-native";
import { Checkbox } from "react-native-paper";

interface TermsCheckboxProps {
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;
  onPressTerms: () => void;
  onPressPrivacy: () => void;
  textColor: string;
  color: string;
}

export const TermsCheckbox = ({
  acceptedTerms,
  setAcceptedTerms,
  onPressTerms,
  onPressPrivacy,
  textColor,
  color,
}: TermsCheckboxProps) => (
  <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 15 }}>
    <Checkbox
      status={acceptedTerms ? "checked" : "unchecked"}
      onPress={() => setAcceptedTerms(!acceptedTerms)}
      color={color}
    />
    <View style={{ flex: 1, marginLeft: 8, paddingTop: 8 }}>
      <Text style={{ fontSize: 14, color: textColor, lineHeight: 21 }}>
        I have read and agree to the{" "}
        <Text
          style={{ color, textDecorationLine: "underline" }}
          onPress={onPressTerms}
        >
          Terms & Conditions
        </Text>{" "}
        and{" "}
        <Text
          style={{ color, textDecorationLine: "underline" }}
          onPress={onPressPrivacy}
        >
          Privacy Policy
        </Text>
        .
      </Text>
    </View>
  </View>
);
