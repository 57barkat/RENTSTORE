import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface LocationStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const LocationStep: React.FC<LocationStepProps> = ({
  formData,
  setFormData,
}) => {
  const location = formData.location || {};
  const updateLocation = (key: string, value: string) => {
    setFormData({ ...formData, location: { ...location, [key]: value } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        placeholder="City"
        value={location.city || ""}
        onChangeText={(text) => updateLocation("city", text)}
      />
      <Text style={styles.label}>Area</Text>
      <TextInput
        style={styles.input}
        placeholder="Area"
        value={location.area || ""}
        onChangeText={(text) => updateLocation("area", text)}
      />
      <Text style={styles.label}>Street</Text>
      <TextInput
        style={styles.input}
        placeholder="Street"
        value={location.street || ""}
        onChangeText={(text) => updateLocation("street", text)}
      />
      <Text style={styles.label}>Full Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Address"
        value={location.fullAddress || ""}
        onChangeText={(text) => updateLocation("fullAddress", text)}
      />
    </View>
  );
};

export default LocationStep;

const styles = StyleSheet.create({
  container: { padding: 10 },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
});
