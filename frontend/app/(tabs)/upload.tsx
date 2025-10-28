import React, { FC } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { OptionCard } from "@/components/UploadPropertyComponents/OptionCard";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { styles } from "@/styles/CreateStep";

const CreateStep: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const handleCreateNew = () => {
    router.push("/upload/IntroStep1");
  };

  const handleCreateFromExisting = () => {
    router.push("/DraftProperties" as `${string}:param`);
    console.log("Navigating to existing listings selection.");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
        Start a new listing
      </Text>

      <OptionCard
        iconName="home-plus-outline"
        title="Create a new listing"
        onPress={handleCreateNew}
        backgroundColor={currentTheme.card}
        iconColor={currentTheme.primary}
        textColor={currentTheme.text}
      />

      <View
        style={[styles.separator, { backgroundColor: currentTheme.border }]}
      />

      <OptionCard
        iconName="content-copy"
        title="Create from an existing listing"
        onPress={handleCreateFromExisting}
        backgroundColor={currentTheme.card}
        iconColor={currentTheme.primary}
        textColor={currentTheme.text}
      />
    </View>
  );
};

export default CreateStep;
