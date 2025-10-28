import React, { useState, FC, useContext, useMemo, useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/ListingDescriptionHighlightsScreen";
import { HIGHLIGHTS_DATA } from "@/utils/HighlightsData";
import { Chip } from "@/components/UploadPropertyComponents/DiscriptionChip";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const MAX_SELECTIONS = 2;

const ListingDescriptionHighlightsScreen: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const context = useContext(FormContext);
  if (!context) throw new Error("FormContext is missing!");

  const { data, updateForm } = context;

  const initialHighlights = useMemo(() => {
    return new Set(data?.description?.highlighted ?? []);
  }, [data?.description?.highlighted]);

  const [selectedHighlights, setSelectedHighlights] =
    useState<Set<string>>(initialHighlights);

  useEffect(() => {
    setSelectedHighlights(new Set(data?.description?.highlighted ?? []));
  }, [data?.description?.highlighted]);

  const handleToggleHighlight = (key: string) => {
    setSelectedHighlights((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else if (newSet.size < MAX_SELECTIONS) {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    const highlightsArray = Array.from(selectedHighlights);
    updateForm("description", { highlighted: highlightsArray });
    router.push("/upload/PricingScreen");
  };

  const isNextDisabled = selectedHighlights.size === 0;

  return (
    <StepContainer
      title="Next, let's describe your house"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={56}
    >
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
        Choose up to {MAX_SELECTIONS} highlights. We&apos;ll use these to get
        your description started.
      </Text>

      <View style={styles.chipsContainer}>
        {HIGHLIGHTS_DATA.map((highlight) => (
          <Chip
            key={highlight.key}
            highlight={highlight}
            isSelected={selectedHighlights.has(highlight.key)}
            onToggle={handleToggleHighlight}
            textColor={currentTheme.text}
            iconColor={
              selectedHighlights.has(highlight.key) ? "#fff" : currentTheme.icon
            }
            selectedBackgroundColor={currentTheme.primary}
            unselectedBackgroundColor={currentTheme.card}
          />
        ))}
      </View>
    </StepContainer>
  );
};

export default ListingDescriptionHighlightsScreen;
