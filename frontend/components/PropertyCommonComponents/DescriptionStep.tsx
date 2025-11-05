import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface DescriptionStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const DescriptionStep: React.FC<DescriptionStepProps> = ({
  formData,
  setFormData,
}) => {
  const description = formData.description || { details: "", highlights: [] };

  const updateHighlights = (index: number, value: string) => {
    const highlights = [...(description.highlights || [])];
    highlights[index] = value;
    setFormData({ ...formData, description: { ...description, highlights } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Details</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Enter details"
        multiline
        value={description.details}
        onChangeText={(text) =>
          setFormData({
            ...formData,
            description: { ...description, details: text },
          })
        }
      />

      <Text style={styles.label}>Highlights</Text>
      {(description.highlights || []).map(({ h, i }: any) => (
        <TextInput
          key={i}
          style={styles.input}
          placeholder={`Highlight ${i + 1}`}
          value={h}
          onChangeText={(text) => updateHighlights(i, text)}
        />
      ))}
    </View>
  );
};

export default DescriptionStep;

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
