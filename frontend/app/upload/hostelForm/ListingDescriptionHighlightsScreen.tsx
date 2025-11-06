import React, { useState, FC, useContext } from "react";
import { Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/ListingDescriptionHighlightsScreen";
import { Chip } from "@/components/UploadPropertyComponents/DiscriptionChip";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { HostelFormContext } from "@/contextStore/HostelFormContext";
import { HIGHLIGHTS_DATA } from "@/utils/HighlightsData";

const MealPlanAndRulesScreen: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const context = useContext(HostelFormContext);
  if (!context) throw new Error("HostelFormContext is missing!");
  const { data, updateForm } = context;

  const MAX_SELECTIONS = 2;

  // Meal plans options
  const MEAL_PLANS = [
    {
      key: "Breakfast",
      label: "Breakfast",
      iconName: "food-croissant" as const,
    },
    { key: "Lunch", label: "Lunch", iconName: "food" as const },
    { key: "Dinner", label: "Dinner", iconName: "food-variant" as const },
  ];

  // Hostel rules
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

  // State for meal plans & rules
  const [selectedMealPlans, setSelectedMealPlans] = useState<Set<string>>(
    new Set(data.mealPlan ?? [])
  );
  const [selectedRules, setSelectedRules] = useState<Set<string>>(
    new Set(data.rules ?? [])
  );

  // State for highlights (correct property 'highlighted')
  const [selectedHighlights, setSelectedHighlights] = useState<Set<string>>(
    new Set(data.description?.highlighted ?? [])
  );

  // Toggle functions
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

  // Navigate to next step
  const handleNext = () => {
    updateForm("mealPlan", Array.from(selectedMealPlans));
    updateForm("rules", Array.from(selectedRules));
    updateForm("description", {
      ...data.description,
      highlighted: Array.from(selectedHighlights), // ✅ corrected property
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
            <Chip
              key={plan.key}
              highlight={plan}
              isSelected={selectedMealPlans.has(plan.key)}
              onToggle={handleToggleMealPlan}
              textColor={currentTheme.text}
              iconColor={
                selectedMealPlans.has(plan.key) ? "#fff" : currentTheme.icon
              }
              selectedBackgroundColor={currentTheme.primary}
              unselectedBackgroundColor={currentTheme.card}
            />
          ))}
        </View>

        {/* Rules */}
        <Text
          style={[styles.subtitle, { color: currentTheme.text, marginTop: 24 }]}
        >
          Select or define your hostel rules.
        </Text>
        <View style={styles.chipsContainer}>
          {RULES.map((rule) => (
            <Chip
              key={rule.key}
              highlight={rule}
              isSelected={selectedRules.has(rule.key)}
              onToggle={handleToggleRule}
              textColor={currentTheme.text}
              iconColor={
                selectedRules.has(rule.key) ? "#fff" : currentTheme.icon
              }
              selectedBackgroundColor={currentTheme.primary}
              unselectedBackgroundColor={currentTheme.card}
            />
          ))}
        </View>

        {/* Highlights */}
        <Text
          style={[styles.subtitle, { color: currentTheme.text, marginTop: 24 }]}
        >
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
                selectedHighlights.has(highlight.key)
                  ? "#fff"
                  : currentTheme.icon
              }
              selectedBackgroundColor={currentTheme.primary}
              unselectedBackgroundColor={currentTheme.card}
            />
          ))}
        </View>
      </ScrollView>
    </StepContainer>
  );
};

export default MealPlanAndRulesScreen;
