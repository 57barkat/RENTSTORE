import React from "react";
import { View } from "react-native";
import { InputField } from "./InputField";

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
    <View>
      <InputField
        placeholder="Agency Name"
        value={values.agencyName}
        onChange={handleChange("agencyName")}
        onBlur={handleBlur("agencyName")}
        error={touched.agencyName && errors.agencyName}
        backgroundColor={backgroundColor}
        textColor={textColor}
      />
      <InputField
        placeholder="Agency License"
        value={values.agencyLicense}
        onChange={handleChange("agencyLicense")}
        onBlur={handleBlur("agencyLicense")}
        error={touched.agencyLicense && errors.agencyLicense}
        backgroundColor={backgroundColor}
        textColor={textColor}
      />
    </View>
  );
};
