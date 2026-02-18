import React, { ReactNode, useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/Welcome";
import { StepContainerProps } from "@/types/Welcome.types";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import Toast from "react-native-toast-message";

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
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Form context not found",
      });
      return;
    }

    try {
      setIsSaving(true);
      const result = await formContext.submitDraftData();

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Draft Saved",
          text2: "Your progress has been saved.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to save draft.",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong!",
      });
    } finally {
      setIsSaving(false);
      formContext?.clearForm();
      if (progress >= 100) {
        router.replace("/upload");
      } else {
        router.replace("/homePage");
      }
    }
  };

  const handleNext = async () => {
    if (!onNext) return;
    try {
      setIsSaving(true);
      await onNext();
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong while processing.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCrossPress = () => {
    formContext?.clearForm();
    if (progress >= 20) {
      router.replace("/upload");
    } else {
      router.back();
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

        <TouchableOpacity onPress={handleCrossPress} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={currentTheme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {title}
          </Text>
        )}
        {children}
      </View>

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
            onPress={handleNext}
            style={[
              styles.nextButton,
              {
                backgroundColor: isNextDisabled
                  ? "#BDBDBD"
                  : currentTheme.primary,
                opacity: isNextDisabled || isSaving ? 0.6 : 1,
              },
            ]}
            disabled={isNextDisabled || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={currentTheme.card} />
            ) : (
              <Text
                style={[
                  styles.nextButtonText,
                  {
                    color: isNextDisabled
                      ? currentTheme.text
                      : currentTheme.card,
                  },
                ]}
              >
                {nextButtonText}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Toast />
    </SafeAreaView>
  );
};

export default StepContainer;
