import React, { useState, FC, useContext } from "react";
import { Text, View, TextInput, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/ListingTitleScreen";
import { HostelFormContext } from "@/contextStore/HostelFormContext";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";

const MAX_TITLE_LENGTH = 50;
const MIN_TITLE_LENGTH = 5;

const HostelTitleScreen: FC = () => {
  const context = useContext(HostelFormContext);
  if (!context) throw new Error("HostelFormContext is missing!");

  const { data, updateForm } = context;
  const router = useRouter();
  const [title, setTitle] = useState<string>(data.title ?? "");

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const handleNext = () => {
    updateForm("title", title);
    router.push(
      "/upload/hostelForm/ListingDescriptionHighlightsScreen" as `${string}:param`
    );
  };

  const isNextDisabled = title.trim().length < MIN_TITLE_LENGTH;

  return (
    <StepContainer
      title="Now, let's give your hostel a title"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={48}
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
          placeholder="E.g., Cozy Hostel near City Center"
          placeholderTextColor={currentTheme.muted}
        />
        <Text style={[styles.charCount, { color: currentTheme.muted }]}>
          {title.length}/{MAX_TITLE_LENGTH}
        </Text>
      </View>
    </StepContainer>
  );
};

export default HostelTitleScreen;
