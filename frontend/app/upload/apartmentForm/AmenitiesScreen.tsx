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
import { useTheme } from "@/contextStore/ThemeContext";
import {
  ApartmentFormContext,
  ApartmentFormData,
} from "@/contextStore/ApartmentFormContextType";
import { Colors } from "@/constants/Colors";

const ApartmentAmenitiesScreen: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const context = useContext(ApartmentFormContext);
  if (!context)
    throw new Error(
      "ApartmentAmenitiesScreen must be used within an ApartmentFormProvider"
    );
  const { data, updateForm } = context;

  const initialAmenities = data.amenities
    ? new Set<string>(data.amenities)
    : new Set<string>();
  const [selectedAmenities, setSelectedAmenities] =
    useState<Set<string>>(initialAmenities);

  const handleToggleAmenity = (key: string) =>
    setSelectedAmenities((prev) => toggleAmenity(prev, key));

  const handleNext = () => {
    updateForm(
      "amenities" as keyof ApartmentFormData,
      Array.from(selectedAmenities)
    );
    router.push("/upload/apartmentForm/PhotosScreen");
  };

  return (
    <StepContainer
      title="Tell persons what your apartment offers"
      onNext={handleNext}
      isNextDisabled={isNextDisabled(selectedAmenities)}
      progress={50}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          You can add more amenities after publishing your apartment listing.
        </Text>

        {AMENITIES_DATA.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {section.title}
            </Text>
            <View style={styles.itemsGrid}>
              {section.items.map((item) => (
                <AmenityCard
                  key={item.key}
                  item={item}
                  isSelected={selectedAmenities.has(item.key)}
                  onToggle={handleToggleAmenity}
                  textColor={currentTheme.text}
                  iconColor={
                    selectedAmenities.has(item.key) ? "#fff" : currentTheme.icon
                  }
                  selectedBackgroundColor={currentTheme.primary}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </StepContainer>
  );
};

export default ApartmentAmenitiesScreen;
