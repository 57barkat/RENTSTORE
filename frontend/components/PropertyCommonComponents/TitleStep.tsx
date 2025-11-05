import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface TitleStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const TitleStep: React.FC<TitleStepProps> = ({ formData, setFormData }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Property Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter property title"
        value={formData.title || ""}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
      />
    </View>
  );
};

export default TitleStep;

const styles = StyleSheet.create({
  container: { padding: 10 },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
