import React, { FC } from "react";
import { Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import StepContainer from "./Welcome";
import { styles } from "@/styles/IntroStep1";
import { StepItem } from "@/components/UploadPropertyComponents/StepItem";
import { stepsData } from "@/utils/stepsData";

const IntroStep1: FC = () => {
  const router = useRouter();

  const handleNext = () => {
    router.push("/upload/CreateStep" as `${string}:param`);
  };

  return (
    <StepContainer onNext={handleNext} showBack={false} progress={10}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>
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
