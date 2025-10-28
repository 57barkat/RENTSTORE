import React, { useContext, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/upload";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const WelcomeScreen = () => {
  const formContext = useContext(FormContext);
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  if (!formContext) {
    throw new Error(
      "FormContext is missing! Make sure WelcomeScreen is wrapped in <FormProvider>."
    );
  }

  const NEW_LISTING_PATH = "/upload/Location";
  const { updateForm, data } = formContext;
  const [selectedType, setSelectedType] = useState<string | null>(
    data.hostOption ?? null
  );

  const hostOptions = [
    { title: "Home", value: "home", icon: "home-city-outline" },
    { title: "Apartment", value: "apartment", icon: "office-building-outline" },
    { title: "Hostel", value: "hostel", icon: "bed-empty" },
  ];

  const handleNext = () => {
    if (!selectedType) return;
    updateForm("hostOption", selectedType);
    router.push(NEW_LISTING_PATH as `${string}:param`);
  };

  return (
    <StepContainer
      title="What would you like to host?"
      showBack={false}
      onNext={handleNext}
      isNextDisabled={!selectedType}
    >
      {hostOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => setSelectedType(option.value)}
          style={[
            styles.card,
            { backgroundColor: currentTheme.card },
            selectedType === option.value && {
              borderColor: currentTheme.primary,
              borderWidth: 2,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: currentTheme.text }]}>
            {option.title}
          </Text>
          <MaterialCommunityIcons
            name={option.icon as any}
            size={60}
            color={currentTheme.primary}
          />
        </TouchableOpacity>
      ))}
    </StepContainer>
  );
};

export default WelcomeScreen;
