import React, { useState, FC, useContext } from "react";
import { Text, View, TextInput, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/ListingTitleScreen";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { FormContext } from "@/contextStore/FormContext";

const MAX_TITLE_LENGTH = 50;
const MIN_TITLE_LENGTH = 5;

const ApartmentTitleScreen: FC = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error("ApartmentFormContext is missing!");

  const { data, updateForm } = context;
  const router = useRouter();
  const [title, setTitle] = useState<string>(data.title ?? "");

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const handleNext = () => {
    updateForm("title", title);
    router.push("/upload/apartmentForm/ListingDescriptionHighlightsScreen");
  };

  const isNextDisabled = title.trim().length < MIN_TITLE_LENGTH;

  return (
    <StepContainer
      title="Now, let's give your apartment a title"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={10}
    >
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
        Short and catchy titles work best. You can always edit it later.
      </Text>

      <View style={[styles.inputContainer]}>
        <TextInput
          multiline
          maxLength={MAX_TITLE_LENGTH}
          value={title}
          onChangeText={setTitle}
          onBlur={Keyboard.dismiss}
          style={[
            styles.textInput,
            { color: currentTheme.text, backgroundColor: currentTheme.card },
          ]}
          placeholder="E.g., Cozy 2BHK Apartment near Downtown"
          placeholderTextColor={currentTheme.muted}
        />
        <Text style={[styles.charCount, { color: currentTheme.muted }]}>
          {title.length}/{MAX_TITLE_LENGTH}
        </Text>
      </View>
    </StepContainer>
  );
};

export default ApartmentTitleScreen;
