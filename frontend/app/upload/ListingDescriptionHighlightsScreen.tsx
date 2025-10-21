import React, { useState, FC, useContext } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/ListingDescriptionHighlightsScreen";
import { HIGHLIGHTS_DATA } from "@/utils/HighlightsData";
import { Chip } from "@/components/UploadPropertyComponents/DiscriptionChip";
import { FormContext } from "@/contextStore/FormContext";

const MAX_SELECTIONS = 2;

const ListingDescriptionHighlightsScreen: FC = () => {
  const router = useRouter();
  const { updateForm } = useContext(FormContext)!;
  const [selectedHighlights, setSelectedHighlights] = useState<Set<string>>(
    new Set()
  );

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
    updateForm("description", { description: highlightsArray.join(", ") });
    router.push("/upload/PricingScreen");
  };

  return (
    <StepContainer
      title="Next, let's describe your house"
      onNext={handleNext}
      isNextDisabled={selectedHighlights.size === 0}
      progress={56}
    >
      <Text style={styles.subtitle}>
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
          />
        ))}
      </View>
    </StepContainer>
  );
};

export default ListingDescriptionHighlightsScreen;
