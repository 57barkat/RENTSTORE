import React, {
  useState,
  FC,
  // , useContext
} from "react";
import { Text, View, TextInput, Keyboard, TextStyle } from "react-native";
import { useRouter } from "expo-router";

import StepContainer from "@/app/upload/Welcome";
// import { FormContext, FormContextType } from "@/contextStore/FormContext";
import { styles } from "@/styles/FinalDescriptionScreen";

interface FinalDescriptionScreenProps {
  initialHighlights?: string[];
}

const MAX_DESCRIPTION_LENGTH = 500;
const MIN_DESCRIPTION_LENGTH = 50;

const generateInitialText = (highlights: string[]): string => {
  if (
    highlights.includes("family_friendly") &&
    highlights.includes("stylish")
  ) {
    return "Have fun with the whole family at this stylish place.";
  }
  return "";
};

const FinalDescriptionScreen: FC<FinalDescriptionScreenProps> = ({
  initialHighlights = ["family_friendly", "stylish"],
}) => {
  // const ctx = useContext<FormContextType | undefined>(FormContext);
  const router = useRouter();
  const initialText = generateInitialText(initialHighlights);

  const [description, setDescription] = useState<string>(initialText);

  const handleNext = () => {
    router.push("/upload/BookingSettingsScreen");
    console.log("Final Description saved:", description);
  };

  const isNextDisabled = description.length < MIN_DESCRIPTION_LENGTH;

  return (
    <StepContainer
      title="Create your description"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={65}
    >
      <Text style={styles.subtitle}>Share what makes your place special.</Text>

      <View style={styles.inputContainer}>
        <TextInput
          multiline
          numberOfLines={8}
          maxLength={MAX_DESCRIPTION_LENGTH}
          value={description}
          onChangeText={setDescription}
          onBlur={Keyboard.dismiss}
          style={styles.textInput as TextStyle}
          placeholder="Tell guests what makes your listing unique..."
        />
        <Text style={styles.charCount}>
          {description.length}/{MAX_DESCRIPTION_LENGTH}
        </Text>
      </View>
    </StepContainer>
  );
};

export default FinalDescriptionScreen;
