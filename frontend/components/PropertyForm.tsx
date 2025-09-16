import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import LocationPicker from "@/utils/LocationPicker";
import * as ImagePicker from "expo-image-picker";
import { propertyValidationSchema } from "@/utils/propertyValidator";
import { Colors } from "@/constants/Colors";

export default function PropertyForm({
  formData,
  onChange,
}: {
  formData: any;
  onChange: (key: string, value: any) => void;
}) {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [mediaLoading, setMediaLoading] = useState<"photo" | null>(null);

  const pickMedia = async () => {
    setMediaLoading("photo");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled && result.assets) {
        onChange("images", [...(formData.images || []), ...result.assets]);
      }
    } finally {
      setMediaLoading(null);
    }
  };

  function parseNumber(val: string) {
    const num = Number(val);
    return isNaN(num) ? 0 : num;  
  }

  function parseBoolean(val: any) {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val === "true";
    return Boolean(val);
  }

  const handleChange = async (key: string, value: any) => {
    const numericFields = [
      "bedrooms",
      "bathrooms",
      "kitchens",
      "livingRooms",
      "balconies",
      "floor",
      "area",
      "rentPrice",
      "securityDeposit",
      "maintenanceCharges",
      "latitude",
      "longitude",
    ];
    const booleanFields = ["furnished", "utilitiesIncluded", "petsAllowed"];
    const arrayFields = ["images", "amenities"];

    let parsedValue = value;

    if (numericFields.includes(key)) parsedValue = parseNumber(value);
    else if (booleanFields.includes(key)) parsedValue = parseBoolean(value);
    else if (arrayFields.includes(key)) parsedValue = Array.isArray(value) ? value : [];

    onChange(key, parsedValue);

    try {
      await propertyValidationSchema.validate(
        { ...formData, [key]: parsedValue },
        { abortEarly: false }
      );
      setErrors({});
    } catch (err: any) {
      const fieldErrors: { [key: string]: string } = {};
      if (err.inner) {
        err.inner.forEach((e: any) => {
          if (e.path) fieldErrors[e.path] = e.message;
        });
      }
      setErrors(fieldErrors);
    }
  };

  return (
    <View>
      <TextInput
        style={[styles.input, themeStyle(currentTheme)]}
        placeholder="Property Type (House, Apartment...)"
        placeholderTextColor={currentTheme.muted}
        value={formData.propertyType}
        onChangeText={(val) => handleChange("propertyType", val)}
      />
      {errors.propertyType && <Text style={styles.error}>{errors.propertyType}</Text>}

      <TextInput
        style={[styles.input, themeStyle(currentTheme)]}
        placeholder="Title"
        placeholderTextColor={currentTheme.muted}
        value={formData.title}
        onChangeText={(val) => handleChange("title", val)}
      />
      {errors.title && <Text style={styles.error}>{errors.title}</Text>}

      <TextInput
        style={[styles.input, themeStyle(currentTheme)]}
        placeholder="City"
        placeholderTextColor={currentTheme.muted}
        value={formData.city}
        onChangeText={(val) => handleChange("city", val)}
      />
      {errors.city && <Text style={styles.error}>{errors.city}</Text>}

      {[
        { key: "bedrooms", label: "Bedrooms" },
        { key: "bathrooms", label: "Bathrooms" },
        { key: "kitchens", label: "Kitchens" },
        { key: "livingRooms", label: "Living Rooms" },
        { key: "balconies", label: "Balconies" },
        { key: "floor", label: "Floor" },
        { key: "area", label: "Area (sq ft)" },
        { key: "rentPrice", label: "Rent Price" },
        { key: "securityDeposit", label: "Security Deposit" },
        { key: "maintenanceCharges", label: "Maintenance Charges" },
      ].map(({ key, label }) => (
        <TextInput
          key={key}
          style={[styles.input, themeStyle(currentTheme)]}
          placeholder={label}
          placeholderTextColor={currentTheme.muted}
          value={formData[key]?.toString() ?? "0"}
          onChangeText={(val) => handleChange(key, val)}
          keyboardType="numeric"
        />
      ))}

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
        {["furnished", "utilitiesIncluded", "petsAllowed"].map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.toggleBtn,
              {
                backgroundColor: !!formData[key] ? currentTheme.primary : currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
            onPress={() => handleChange(key, !formData[key])}
          >
            <Text style={{ color: !!formData[key] ? "#fff" : currentTheme.text, fontSize: 13 }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amenities */}
      <Text style={[styles.subHeader, { color: currentTheme.text }]}>Amenities</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
        {["electricity", "water", "gas", "internet", "parking", "security", "lift"].map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.toggleBtn,
              {
                backgroundColor: formData.amenities?.includes(key)
                  ? currentTheme.primary
                  : currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
            onPress={() => {
              const amenities = formData.amenities || [];
              handleChange(
                "amenities",
                amenities.includes(key)
                  ? amenities.filter((a: string) => a !== key)
                  : [...amenities, key]
              );
            }}
          >
            <Text style={{ color: formData.amenities?.includes(key) ? "#fff" : currentTheme.text, fontSize: 13 }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preferences */}
      <TextInput
        style={[styles.input, themeStyle(currentTheme)]}
        placeholder="Preferences (comma separated)"
        placeholderTextColor={currentTheme.muted}
        value={formData.preferences}
        onChangeText={(val) => handleChange("preferences", val)}
      />

      {/* Media Upload */}
      <TouchableOpacity
        style={[styles.uploadBtn, { borderColor: currentTheme.primary }]}
        onPress={pickMedia}
        disabled={mediaLoading === "photo"}
      >
        {mediaLoading === "photo" ? (
          <ActivityIndicator color={currentTheme.primary} />
        ) : (
          <Text style={[styles.uploadText, { color: currentTheme.primary }]}>+ Add Photos</Text>
        )}
      </TouchableOpacity>
      {formData.images?.length > 0 &&
        formData.images.map((img: any, idx: number) => (
          <Text key={idx} style={{ color: currentTheme.text, fontSize: 13 }}>
            {img.fileName || img.uri?.split("/").pop() || `Photo ${idx + 1}`}
          </Text>
        ))}

      {/* Description */}
      <TextInput
        style={[styles.input, styles.textarea, themeStyle(currentTheme)]}
        placeholder="Description"
        placeholderTextColor={currentTheme.muted}
        value={formData.description}
        onChangeText={(val) => handleChange("description", val)}
        multiline
      />

      {/* Location */}
      <Text style={[styles.subHeader, { color: currentTheme.text }]}>Select Location</Text>
      <LocationPicker
        onPick={(lat, lng, address) => {
          handleChange("latitude", lat);
          handleChange("longitude", lng);
          handleChange("address", address);
        }}
      />

      {/* Address */}
      <TextInput
        style={[styles.input, themeStyle(currentTheme)]}
        placeholder="Address"
        placeholderTextColor={currentTheme.muted}
        value={formData.address}
        onChangeText={(val) => handleChange("address", val)}
      />
    </View>
  );
}

function themeStyle(currentTheme: any) {
  return {
    borderColor: currentTheme.border,
    color: currentTheme.text,
    backgroundColor: currentTheme.card,
  };
}

const styles = StyleSheet.create({
  subHeader: { fontSize: 18, fontWeight: "600", marginTop: 15, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  textarea: { height: 100, textAlignVertical: "top" },
  uploadBtn: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10, alignItems: "center" },
  uploadText: { fontWeight: "600" },
  toggleBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  error: { color: "red" },
});
