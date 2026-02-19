import React, { useState, FC, useContext } from "react";
import { Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/ListingDescriptionHighlightsScreen";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { FormContext } from "@/contextStore/FormContext";
import { HIGHLIGHTS_DATA } from "@/utils/HighlightsData";
import { AmenityCard } from "@/components/UploadPropertyComponents/AmenityCard";

const MealPlanAndRulesScreen: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const context = useContext(FormContext);
  if (!context) throw new Error("FormContext is missing!");
  const { data, updateForm } = context;

  const MAX_SELECTIONS = 2;

  const MEAL_PLANS = [
    {
      key: "breakfast",
      label: "Breakfast",
      iconName: "food-croissant" as const,
    },
    { key: "lunch", label: "Lunch", iconName: "food" as const },
    { key: "dinner", label: "Dinner", iconName: "food-variant" as const },
  ];

  const RULES = [
    {
      key: "No smoking",
      label: "No smoking",
      iconName: "smoking-off" as const,
    },
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
    {
      key: "Keep rooms clean",
      label: "Keep rooms clean",
      iconName: "broom" as const,
    },
    {
      key: "Respect others' privacy",
      label: "Respect others' privacy",
      iconName: "account-group" as const,
    },
  ];

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
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const handleToggleRule = (key: string) => {
    setSelectedRules((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

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
      title="Add your hostel’s meal plans, rules & highlights"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={60}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Meal Plans */}
        <Text style={[styles.subtitle, { color: currentTheme.text }]}>
          Select the meal plans offered to residents.
        </Text>
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

        <Text
          style={[styles.subtitle, { color: currentTheme.text, marginTop: 24 }]}
        >
          Select or define your hostel rules.
        </Text>
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

        <Text
          style={[styles.subtitle, { color: currentTheme.text, marginTop: 24 }]}
        >
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
