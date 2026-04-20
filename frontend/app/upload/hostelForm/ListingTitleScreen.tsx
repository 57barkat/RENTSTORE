import React, { FC, useContext, useState } from "react";
import { Keyboard, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import StepContainer from "@/app/upload/Welcome";
import { Colors } from "@/constants/Colors";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { styles } from "@/styles/ListingTitleScreen";
import {
  PROPERTY_UPLOAD_TOTAL_STEPS,
  buildDisabledReason,
} from "@/utils/propertyTypes";

const MAX_TITLE_LENGTH = 50;
const MIN_TITLE_LENGTH = 5;

const HostelTitleScreen: FC = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("FormContext is missing!");
  }

  const { data, updateForm } = context;
  const router = useRouter();
  const [title, setTitle] = useState<string>(data.title ?? "");

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const handleNext = () => {
    updateForm("title", title);
    router.push(
      "/upload/hostelForm/ListingDescriptionHighlightsScreen" as `${string}:param`,
    );
  };

  const isNextDisabled = title.trim().length < MIN_TITLE_LENGTH;

  return (
    <StepContainer
      title="Now, let's give your hostel a title"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={48}
      nextDisabledReason={buildDisabledReason([
        isNextDisabled
          ? `Add a title with at least ${MIN_TITLE_LENGTH} characters to continue.`
          : undefined,
      ])}
      stepNumber={6}
      totalSteps={PROPERTY_UPLOAD_TOTAL_STEPS}
    >
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
        Short and catchy titles work best, but they still need enough detail to
        feel useful.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          multiline
          maxLength={MAX_TITLE_LENGTH}
          value={title}
          onChangeText={setTitle}
          onBlur={Keyboard.dismiss}
          style={[
            styles.textInput,
            {
              color: currentTheme.text,
              backgroundColor: currentTheme.card,
              borderColor: isNextDisabled
                ? currentTheme.error
                : currentTheme.border,
            },
          ]}
          placeholder="E.g., Cozy hostel near city center"
          placeholderTextColor={currentTheme.muted}
        />
        <Text style={[styles.charCount, { color: currentTheme.muted }]}>
          {title.length}/{MAX_TITLE_LENGTH}
        </Text>
      </View>

      {isNextDisabled ? (
        <Text
          style={{
            color: currentTheme.error,
            marginTop: 12,
            fontWeight: "600",
          }}
        >
          Make the title a little longer so renters can understand the listing.
        </Text>
      ) : null}
    </StepContainer>
  );
};

export default HostelTitleScreen;
