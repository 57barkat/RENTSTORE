import React, { useState, FC, useContext } from "react";
import { Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import {
  AMENITIES_DATA,
  toggleAmenity,
  isNextDisabled,
} from "@/utils/Aminities";
import { styles } from "@/styles/AmenitiesScreen";
import { AmenityCard } from "@/components/UploadPropertyComponents/AmenityCard";
// import { HostelFormContext, HostelFormData } from "@/contextStore/HostelFormContext";
import { FormContext, FormData } from "@/contextStore/FormContext";

import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";

const HostelAmenitiesScreen: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  // --- Context Consumption ---
  const context = useContext(FormContext);

  if (!context) {
    throw new Error(
      "HostelAmenitiesScreen must be used within a HostelFormProvider"
    );
  }

  const { data, updateForm } = context;

  // --- State Initialization ---
  const initialAmenities = data.amenities
    ? new Set<string>(data.amenities)
    : new Set<string>();

  const [selectedAmenities, setSelectedAmenities] =
    useState<Set<string>>(initialAmenities);

  // --- Handlers ---
  const handleToggleAmenity = (key: string) => {
    setSelectedAmenities((prev) => toggleAmenity(prev, key));
  };

  const handleNext = () => {
    const amenitiesKeys = Array.from(selectedAmenities);
    updateForm("amenities" as keyof FormData, amenitiesKeys);
    console.log("Selected hostel amenities saved to context:", amenitiesKeys);

    // Hostel-specific next screen
    router.push("/upload/hostelForm/PhotosScreen" as `${string}:param`);
  };

  return (
    <StepContainer
      title="Tell Persons what your hostel has to offer"
      onNext={handleNext}
      isNextDisabled={isNextDisabled(selectedAmenities)}
      progress={33} // Adjust if needed for hostel flow
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          You can add more amenities after you publish your hostel listing.
        </Text>

        {AMENITIES_DATA.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {section.title}
            </Text>
            <View style={styles.itemsGrid}>
              {section.items.map((item) => {
                const isItemSelected = selectedAmenities.has(item.key);

                return (
                  <AmenityCard
                    key={item.key}
                    item={item}
                    isSelected={isItemSelected}
                    onToggle={handleToggleAmenity}
                    textColor={currentTheme.text}
                    iconColor={isItemSelected ? "#fff" : currentTheme.icon}
                    selectedBackgroundColor={currentTheme.primary}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </StepContainer>
  );
};

export default HostelAmenitiesScreen;
