import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";
import LocationPicker from "@/utils/LocationPicker";

export default function Upload() {
  const [formData, setFormData] = useState({
    propertyType: "",
    title: "",
    description: "",
    address: "",
    city: "",
    bedrooms: "",
    bathrooms: "",
    kitchens: "",
    livingRooms: "",
    balcony: false,
    furnished: false,
    floor: "",
    area: "",
    rent: "",
    deposit: "",
    maintenance: "",
    utilitiesIncluded: false,
    ownerName: "",
    phone: "",
    email: "",
    photos: [],
    videos: [],
    electricity: false,
    water: false,
    gas: false,
    internet: false,
    parking: false,
    security: false,
    lift: false,
    suitableFor: "",
    genderPreference: "",
    petsAllowed: false,
    latitude: null,
    longitude: null,
  });

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    console.log("📤 Uploading property:", formData);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: currentTheme.background },
      ]}
    >
      <Text style={[styles.header, { color: currentTheme.primary }]}>
        Upload Property
      </Text>

      {/* Basic Info */}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Property Type (House, Apartment...)"
        placeholderTextColor={currentTheme.muted}
        value={formData.propertyType}
        onChangeText={(val: string) => handleChange("propertyType", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Title"
        placeholderTextColor={currentTheme.muted}
        value={formData.title}
        onChangeText={(val: string) => handleChange("title", val)}
      />
      <TextInput
        style={[
          styles.input,
          styles.textarea,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Description"
        placeholderTextColor={currentTheme.muted}
        value={formData.description}
        onChangeText={(val: string) => handleChange("description", val)}
        multiline
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Address"
        placeholderTextColor={currentTheme.muted}
        value={formData.address}
        onChangeText={(val: string) => handleChange("address", val)}
      />

      {/* Location */}
      <Text style={[styles.subHeader, { color: currentTheme.text }]}>
        Select Location
      </Text>
      <LocationPicker
        onPick={(lat, lng, address) => {
          handleChange("latitude", lat);
          handleChange("longitude", lng);
          if (address) handleChange("address", address);
        }}
      />
      <Text style={{ color: currentTheme.text }}>
        Selected:{" "}
        {formData.latitude && formData.longitude
          ? `${formData.latitude}, ${formData.longitude}`
          : "Not selected"}
      </Text>
      <Text style={{ color: currentTheme.text }}>
        {formData.address ? `Address: ${formData.address}` : ""}
      </Text>

      {/* City */}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="City / Area"
        placeholderTextColor={currentTheme.muted}
        value={formData.city}
        onChangeText={(val: string) => handleChange("city", val)}
      />

      {/* Rooms */}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Bedrooms"
        keyboardType="numeric"
        value={formData.bedrooms}
        onChangeText={(val: string) => handleChange("bedrooms", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Bathrooms"
        keyboardType="numeric"
        value={formData.bathrooms}
        onChangeText={(val: string) => handleChange("bathrooms", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Kitchens"
        keyboardType="numeric"
        value={formData.kitchens}
        onChangeText={(val: string) => handleChange("kitchens", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Living Rooms"
        keyboardType="numeric"
        value={formData.livingRooms}
        onChangeText={(val: string) => handleChange("livingRooms", val)}
      />

      {/* Switches */}
      <SwitchRow
        label="Balcony / Terrace"
        value={formData.balcony}
        onChange={(val: boolean) => handleChange("balcony", val)}
      />
      <SwitchRow
        label="Furnished"
        value={formData.furnished}
        onChange={(val: boolean) => handleChange("furnished", val)}
      />

      {/* Area & Pricing */}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Floor (if apartment)"
        placeholderTextColor={currentTheme.muted}
        value={formData.floor}
        onChangeText={(val: string) => handleChange("floor", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Total Area (Marla / Sq. Ft)"
        placeholderTextColor={currentTheme.muted}
        value={formData.area}
        onChangeText={(val: string) => handleChange("area", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Rent Price (per month)"
        keyboardType="numeric"
        value={formData.rent}
        onChangeText={(val: string) => handleChange("rent", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Security Deposit"
        keyboardType="numeric"
        value={formData.deposit}
        onChangeText={(val: string) => handleChange("deposit", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Maintenance Charges"
        keyboardType="numeric"
        value={formData.maintenance}
        onChangeText={(val: string) => handleChange("maintenance", val)}
      />
      <SwitchRow
        label="Utilities Included"
        value={formData.utilitiesIncluded}
        onChange={(val: boolean) => handleChange("utilitiesIncluded", val)}
      />

      {/* Owner Info */}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Owner / Agent Name"
        placeholderTextColor={currentTheme.muted}
        value={formData.ownerName}
        onChangeText={(val: string) => handleChange("ownerName", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(val: string) => handleChange("phone", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(val: string) => handleChange("email", val)}
      />

      {/* Upload Media */}
      <Text style={[styles.subHeader, { color: currentTheme.text }]}>
        Upload Photos & Videos
      </Text>
      <TouchableOpacity
        style={[styles.uploadBtn, { borderColor: currentTheme.primary }]}
      >
        <Text style={[styles.uploadText, { color: currentTheme.primary }]}>
          + Add Photos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.uploadBtn, { borderColor: currentTheme.primary }]}
      >
        <Text style={[styles.uploadText, { color: currentTheme.primary }]}>
          + Add Videos
        </Text>
      </TouchableOpacity>

      {/* Amenities */}
      <Text style={[styles.subHeader, { color: currentTheme.text }]}>
        Amenities & Facilities
      </Text>
      <SwitchRow
        label="Electricity Backup"
        value={formData.electricity}
        onChange={(val: boolean) => handleChange("electricity", val)}
      />
      <SwitchRow
        label="Water Supply"
        value={formData.water}
        onChange={(val: boolean) => handleChange("water", val)}
      />
      <SwitchRow
        label="Gas Supply"
        value={formData.gas}
        onChange={(val: boolean) => handleChange("gas", val)}
      />
      <SwitchRow
        label="Internet / WiFi"
        value={formData.internet}
        onChange={(val: boolean) => handleChange("internet", val)}
      />
      <SwitchRow
        label="Parking Space"
        value={formData.parking}
        onChange={(val: boolean) => handleChange("parking", val)}
      />
      <SwitchRow
        label="Security / CCTV"
        value={formData.security}
        onChange={(val: boolean) => handleChange("security", val)}
      />
      <SwitchRow
        label="Lift (if apartment)"
        value={formData.lift}
        onChange={(val: boolean) => handleChange("lift", val)}
      />

      {/* Preferences */}
      <Text style={[styles.subHeader, { color: currentTheme.text }]}>
        Preferences
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Suitable For (Families, Students...)"
        placeholderTextColor={currentTheme.muted}
        value={formData.suitableFor}
        onChangeText={(val: string) => handleChange("suitableFor", val)}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: currentTheme.border,
            color: currentTheme.text,
            backgroundColor: currentTheme.card,
          },
        ]}
        placeholder="Gender Preference (if hostel/room)"
        placeholderTextColor={currentTheme.muted}
        value={formData.genderPreference}
        onChangeText={(val: string) => handleChange("genderPreference", val)}
      />
      <SwitchRow
        label="Pets Allowed"
        value={formData.petsAllowed}
        onChange={(val: boolean) => handleChange("petsAllowed", val)}
      />

      {/* Submit */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: currentTheme.primary }]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Submit Property</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SwitchRow({ label, value, onChange }: any) {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  return (
    <View style={styles.switchRow}>
      <Text style={[styles.switchLabel, { color: currentTheme.text }]}>
        {label}
      </Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textarea: { height: 100, textAlignVertical: "top" },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  uploadBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  uploadText: { fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  switchLabel: { fontSize: 16 },
});
