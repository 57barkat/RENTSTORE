import React, { FC, useContext, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import StepContainer from "@/app/upload/Welcome";
import { AmenityCard } from "@/components/UploadPropertyComponents/AmenityCard";
import { Colors } from "@/constants/Colors";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { styles } from "@/styles/ListingDescriptionHighlightsScreen";
import { HIGHLIGHTS_DATA } from "@/utils/HighlightsData";
import {
  PROPERTY_UPLOAD_TOTAL_STEPS,
  buildDisabledReason,
} from "@/utils/propertyTypes";

const MAX_SELECTIONS = 2;

const MEAL_PLANS = [
  { key: "breakfast", label: "Breakfast", iconName: "food-croissant" as const },
  { key: "lunch", label: "Lunch", iconName: "food" as const },
  { key: "dinner", label: "Dinner", iconName: "food-variant" as const },
];

const RULES = [
  { key: "No smoking", label: "No smoking", iconName: "smoking-off" as const },
  {
    key: "No loud music after 10 PM",
    label: "No loud music after 10 PM",
    iconName: "music-off" as const,
  },
  {
    key: "Visitors not allowed",
    label: "Visitors not allowed",
    iconName: "account-off" as const,
  },
  { key: "Keep rooms clean", label: "Keep rooms clean", iconName: "broom" as const },
  {
    key: "Respect others' privacy",
    label: "Respect others' privacy",
    iconName: "account-group" as const,
  },
];

const MealPlanAndRulesScreen: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const context = useContext(FormContext);
  if (!context) {
    throw new Error("FormContext is missing!");
  }

  const { data, updateForm } = context;
  const [selectedMealPlans, setSelectedMealPlans] = useState<Set<string>>(
    new Set(data.mealPlan ?? []),
  );
  const [selectedRules, setSelectedRules] = useState<Set<string>>(
    new Set(data.rules ?? []),
  );
  const [selectedHighlights, setSelectedHighlights] = useState<Set<string>>(
    new Set(data.description?.highlighted ?? []),
  );

  const handleToggleMealPlan = (key: string) => {
    setSelectedMealPlans((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleToggleRule = (key: string) => {
    setSelectedRules((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleToggleHighlight = (key: string) => {
    setSelectedHighlights((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else if (next.size < MAX_SELECTIONS) {
        next.add(key);
      }
      return next;
    });
  };

  const handleNext = () => {
    updateForm("mealPlan", Array.from(selectedMealPlans));
    updateForm("rules", Array.from(selectedRules));
    updateForm("description", {
      ...data.description,
      highlighted: Array.from(selectedHighlights),
    });
    router.push("/upload/hostelForm/PricingScreen" as `${string}:param`);
  };

  const isNextDisabled =
    selectedMealPlans.size === 0 || selectedRules.size === 0;

  return (
    <StepContainer
      title="Add your hostel meal plans, rules and highlights"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={60}
      nextDisabledReason={buildDisabledReason([
        selectedMealPlans.size === 0
          ? "Select at least one meal plan to continue."
          : undefined,
        selectedRules.size === 0
          ? "Select at least one house rule to continue."
          : undefined,
      ])}
      stepNumber={7}
      totalSteps={PROPERTY_UPLOAD_TOTAL_STEPS}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: currentTheme.text }]}>
          Select the meal plans offered to residents.
        </Text>
        {selectedMealPlans.size === 0 ? (
          <Text
            style={{
              color: currentTheme.error,
              marginBottom: 12,
              fontWeight: "600",
            }}
          >
            Pick at least one meal plan to continue.
          </Text>
        ) : null}
        <View style={styles.chipsContainer}>
          {MEAL_PLANS.map((plan) => (
            <AmenityCard
              key={plan.key}
              item={plan}
              isSelected={selectedMealPlans.has(plan.key)}
              onToggle={handleToggleMealPlan}
              textColor={currentTheme.text}
              iconColor={
                selectedMealPlans.has(plan.key) ? "#fff" : currentTheme.icon
              }
              selectedBackgroundColor={currentTheme.primary}
            />
          ))}
        </View>

        <Text style={[styles.subtitle, { color: currentTheme.text, marginTop: 24 }]}>
          Select or define your hostel rules.
        </Text>
        {selectedRules.size === 0 ? (
          <Text
            style={{
              color: currentTheme.error,
              marginBottom: 12,
              fontWeight: "600",
            }}
          >
            Pick at least one rule to continue.
          </Text>
        ) : null}
        <View style={styles.chipsContainer}>
          {RULES.map((rule) => (
            <AmenityCard
              key={rule.key}
              item={rule}
              isSelected={selectedRules.has(rule.key)}
              onToggle={handleToggleRule}
              textColor={currentTheme.text}
              iconColor={
                selectedRules.has(rule.key) ? "#fff" : currentTheme.icon
              }
              selectedBackgroundColor={currentTheme.primary}
            />
          ))}
        </View>

        <Text style={[styles.subtitle, { color: currentTheme.text, marginTop: 24 }]}>
          Choose up to {MAX_SELECTIONS} highlights. We&apos;ll use these to get
          your description started.
        </Text>
        <View style={styles.chipsContainer}>
          {HIGHLIGHTS_DATA.map((highlight) => (
            <AmenityCard
              key={highlight.key}
              item={highlight}
              isSelected={selectedHighlights.has(highlight.key)}
              onToggle={handleToggleHighlight}
              textColor={currentTheme.text}
              iconColor={
                selectedHighlights.has(highlight.key)
                  ? "#fff"
                  : currentTheme.icon
              }
              selectedBackgroundColor={currentTheme.primary}
            />
          ))}
        </View>
      </ScrollView>
    </StepContainer>
  );
};

export default MealPlanAndRulesScreen;
