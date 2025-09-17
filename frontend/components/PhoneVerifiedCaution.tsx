import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PhoneVerifiedCaution() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        ⚠️ Your phone number is verified. Your account may be deleted soon, and
        some services may be unavailable.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FFF3CD",  
    padding: 12,
    borderRadius: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: "#FFEEBA",
  },
  text: {
    color: "#856404", 
    fontSize: 14,
    fontWeight: "500",
  },
});
