import React, { FC } from "react";
import { Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

import StepContainer from "./Welcome";
import { styles } from "@/styles/IntroStep1";
import { StepItem } from "@/components/UploadPropertyComponents/StepItem";
import { stepsData } from "@/utils/stepsData";
import AsyncStorage from "@react-native-async-storage/async-storage";

const IntroStep1: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const handleNext = async () => {
    await AsyncStorage.setItem("seen", "true");  
    router.push("/upload/CreateStep" as `${string}:param`);
  };

  return (
    <StepContainer onNext={handleNext} showBack={false} progress={10}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: currentTheme.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.mainTitle, { color: currentTheme.text }]}>
          It&apos;s easy to get started on RentStore
        </Text>

        {stepsData.map((step) => (
          <StepItem key={step.stepNumber} {...step} />
        ))}
      </ScrollView>
    </StepContainer>
  );
};

export default IntroStep1;
