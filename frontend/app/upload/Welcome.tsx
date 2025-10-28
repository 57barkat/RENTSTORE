import React, { ReactNode, useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/Welcome";
import { StepContainerProps } from "@/types/Welcome.types";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const StepContainer: React.FC<StepContainerProps> = ({
  title,
  showBack = true,
  children,
  onNext,
  isNextDisabled = false,
  progress = 0,
}) => {
  const router = useRouter();
  const formContext = useContext(FormContext);
  const [isSaving, setIsSaving] = useState(false);

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const handleBack = () => {
    if (showBack) router.back();
  };

  const handleExit = async () => {
    if (!formContext) {
      Alert.alert("Error", "Form context not found");
      return;
    }

    try {
      setIsSaving(true);
      const result = await formContext.submitDraftData();
      if (result.success) {
        Alert.alert(
          "Draft saved!",
          "Your progress has been saved successfully."
        );
      } else {
        Alert.alert("Error", "Failed to save draft.");
        console.error(result.error);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while saving the draft.");
    } finally {
      setIsSaving(false);
      router.replace("/homePage");
    }
  };

  const nextButtonText = progress >= 100 ? "Finish" : "Next";

  return (
    <SafeAreaView
      style={[styles.fullScreen, { backgroundColor: currentTheme.background }]}
    >
      <View style={styles.header}>
        {progress >= 20 &&
          progress <= 99 &&
          (formContext?.data?.status === undefined ||
            formContext?.data?.status === false) && (
            <TouchableOpacity
              onPress={handleExit}
              style={styles.headerButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={currentTheme.primary} />
              ) : (
                <Text style={[styles.headerText, { color: currentTheme.text }]}>
                  Save & Exit
                </Text>
              )}
            </TouchableOpacity>
          )}

        <TouchableOpacity
          onPress={() => router.push("/upload")}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={currentTheme.text} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {title}
          </Text>
        )}
        {children}
      </View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <View
          style={[
            styles.progressBarContainer,
            { backgroundColor: currentTheme.border },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%`, backgroundColor: currentTheme.primary },
            ]}
          />
        </View>

        <View style={styles.navBar}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack}>
              <Text
                style={[styles.backButtonText, { color: currentTheme.text }]}
              >
                Back
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <TouchableOpacity
            onPress={onNext}
            style={[
              styles.nextButton,
              isNextDisabled && styles.disabledNextButton,
              { backgroundColor: currentTheme.primary },
            ]}
            disabled={isNextDisabled}
          >
            <Text style={[styles.nextButtonText, { color: currentTheme.card }]}>
              {nextButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StepContainer;
