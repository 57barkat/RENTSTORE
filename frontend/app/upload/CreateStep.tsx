import React, { useContext, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/upload";
import { FormContext } from "@/contextStore/FormContext";
import { HostelFormContext } from "@/contextStore/HostelFormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { ApartmentFormContext } from "@/contextStore/ApartmentFormContextType";

const WelcomeScreen = () => {
  const formContext = useContext(FormContext);
  const hostelFormContext = useContext(HostelFormContext);
  const appartmentFormContext = useContext(ApartmentFormContext);

  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [selectedType, setSelectedType] = useState<string | null>(
    formContext?.data.hostOption ?? null
  );

  const hostOptions = [
    { title: "Home", value: "home", icon: "home-city-outline" },
    { title: "Apartment", value: "apartment", icon: "office-building-outline" },
    { title: "Hostel", value: "hostel", icon: "bed-empty" },
  ];

  const handleNext = () => {
    if (!selectedType) return;

    if (selectedType === "hostel") {
      if (!hostelFormContext)
        throw new Error(
          "HostelFormContext is missing! Wrap this screen in <HostelFormProvider>."
        );
      hostelFormContext.updateForm("hostOption", selectedType);
      router.push("/upload/hostelForm/Location");
    } else if (selectedType === "apartment") {
      if (!appartmentFormContext)
        throw new Error(
          "FormContext is missing! Wrap this screen in <FormProvider>."
        );
      appartmentFormContext.updateForm("hostOption", selectedType);
      router.push("/upload/apartmentForm/Location");
    } else {
      // Home
      if (!formContext)
        throw new Error(
          "FormContext is missing! Wrap this screen in <FormProvider>."
        );
      formContext.updateForm("hostOption", selectedType);
      router.push("/upload/Location");
    }
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
