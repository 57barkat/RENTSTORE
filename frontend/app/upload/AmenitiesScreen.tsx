import React, { useState, FC, useContext } from "react"; // Added useContext and useEffect
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
// Assuming this is the correct path for your context
import { FormContext, FormData } from "@/contextStore/FormContext";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";

const AmenitiesScreen: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  // --- Context Consumption ---
  const context = useContext(FormContext);

  if (!context) {
    // Safety check: Ensure component is wrapped in FormProvider
    throw new Error("AmenitiesScreen must be used within a FormProvider");
  }

  const { data, updateForm } = context;

  // --- State Initialization ---
  // Initialize state using data from the context, or an empty Set if no data exists
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
    // 1. Convert the Set of selected amenity keys to a string array
    const amenitiesKeys = Array.from(selectedAmenities);

    // 2. Save the array of keys to the global context
    // We cast to 'amenities' key of FormData to ensure type safety
    updateForm("amenities" as keyof FormData, amenitiesKeys);

    console.log("Selected amenities saved to context:", amenitiesKeys);

    // 3. Navigate to the next screen
    router.push("/upload/PhotosScreen" as `${string}:param`);
  };

  return (
    <StepContainer
      title="Tell persons what your place has to offer"
      onNext={handleNext}
      isNextDisabled={isNextDisabled(selectedAmenities)}
      progress={33}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          You can add more amenities after you publish your listing.
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

export default AmenitiesScreen;
