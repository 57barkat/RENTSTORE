import React, { FC, useState, useContext } from "react";
import { Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/ListingDescriptionHighlightsScreen";
import { Chip } from "@/components/UploadPropertyComponents/DiscriptionChip";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors"; 
import { HIGHLIGHTS_DATA } from "@/utils/HighlightsData";
import { ApartmentFormContext } from "@/contextStore/ApartmentFormContextType";
import { AmenityCard } from "@/components/UploadPropertyComponents/AmenityCard";

const MAX_SELECTIONS = 2;

const ApartmentDescriptionHighlightsScreen: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const context = useContext(ApartmentFormContext);
  if (!context) throw new Error("ApartmentFormContext is missing!");
  const { data, updateForm } = context;

  // Only highlights for apartments (no mealPlan/rules)
  const [selectedHighlights, setSelectedHighlights] = useState<Set<string>>(
    new Set(data.description?.highlighted ?? [])
  );

  const handleToggleHighlight = (key: string) => {
    setSelectedHighlights((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else if (newSet.size < MAX_SELECTIONS) newSet.add(key);
      return newSet;
    });
  };

  const handleNext = () => {
    updateForm("description", {
      ...data.description,
      highlighted: Array.from(selectedHighlights),
    });
    router.push("/upload/apartmentForm/PricingScreen");
  };

  const isNextDisabled = selectedHighlights.size === 0;

  return (
    <StepContainer
      title="Add some highlights for your apartment"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={20}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: currentTheme.text }]}>
          Choose up to {MAX_SELECTIONS} highlights. We&apos;ll use these to get your description started.
        </Text>

        <View style={styles.chipsContainer}>
          {HIGHLIGHTS_DATA.map((highlight) => (
            <AmenityCard
              key={highlight.key}
              item={highlight}
              isSelected={selectedHighlights.has(highlight.key)}
              onToggle={handleToggleHighlight}
              textColor={currentTheme.text}
              iconColor={selectedHighlights.has(highlight.key) ? "#fff" : currentTheme.icon}
              selectedBackgroundColor={currentTheme.primary} 
            />
          ))}
        </View>
      </ScrollView>
    </StepContainer>
  );
};

export default ApartmentDescriptionHighlightsScreen;
