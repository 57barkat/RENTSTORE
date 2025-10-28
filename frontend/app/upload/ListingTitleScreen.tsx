import React, { useState, FC, useContext } from "react";
import { Text, View, TextInput, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/ListingTitleScreen";
import { FormContext } from "@/contextStore/FormContext";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";

const MAX_TITLE_LENGTH = 50;
const MIN_TITLE_LENGTH = 5;

const ListingTitleScreen: FC = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error("FormContext is missing!");

  const { data, updateForm } = context;
  const router = useRouter();
  const [title, setTitle] = useState<string>(data.title ?? "");

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const handleNext = () => {
    updateForm("title", title);
    router.push("/upload/ListingDescriptionHighlightsScreen" as `${string}:param`);
  };

  const isNextDisabled = title.length < MIN_TITLE_LENGTH;

  return (
    <StepContainer
      title="Now, let's give your house a title"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={48}
    >
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
        Short titles work best. Have fun with it—you can always change it later.
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
          placeholder="E.g., Sunny Beach Cabin with Ocean View"
          placeholderTextColor={currentTheme.muted}
        />
        <Text style={[styles.charCount, { color: currentTheme.muted }]}>
          {title.length}/{MAX_TITLE_LENGTH}
        </Text>
      </View>
    </StepContainer>
  );
};

export default ListingTitleScreen;
