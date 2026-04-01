import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { InputField } from "./InputField";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export const AgencyFields = ({
  role,
  values,
  handleChange,
  handleBlur,
  errors,
  touched,
  textColor,
  backgroundColor,
}: any) => {
  if (role !== "agency") return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>AGENCY NAME</Text>
      <InputField
        icon={
          <MaterialCommunityIcons
            name="office-building-outline"
            size={20}
            color="#94A3B8"
          />
        }
        placeholder="e.g. Lahore Properties Group"
        value={values.agencyName}
        onChange={handleChange("agencyName")}
        onBlur={() => handleBlur("agencyName")}
        error={touched.agencyName && errors.agencyName}
        backgroundColor={backgroundColor}
      />

      <Text style={[styles.label, { color: textColor }]}>
        OWNER / CONTACT NAME
      </Text>
      <InputField
        icon={<Feather name="user" size={20} color="#94A3B8" />}
        placeholder="Full Name"
        value={values.name}
        onChange={handleChange("name")}
        onBlur={() => handleBlur("name")}
        error={touched.name && errors.name}
        backgroundColor={backgroundColor}
      />

      <Text style={[styles.label, { color: textColor }]}>
        AGENCY LICENSE NO.
      </Text>
      <View style={styles.licenseContainer}>
        <InputField
          icon={<Feather name="file-text" size={20} color="#10B981" />}
          placeholder="e.g. REA-2024-12345"
          value={values.agencyLicense}
          onChange={handleChange("agencyLicense")}
          onBlur={() => handleBlur("agencyLicense")}
          error={touched.agencyLicense && errors.agencyLicense}
          backgroundColor="#F0FDF4"
        />
        <Text style={styles.hintText}>
          Your real estate agency registration certificate number
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 10 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 4, opacity: 0.6 },
  licenseContainer: { marginBottom: 10 },
  hintText: { fontSize: 11, color: "#94A3B8", marginTop: -5, marginLeft: 5 },
});
