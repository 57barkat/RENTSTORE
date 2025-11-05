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
import { FormContext, FormData } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import ConfirmationModal from "@/components/ConfirmDialog";

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
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const handleBack = () => {
    if (showBack) router.back();
  };

  const handleExit = async () => {
    if (!formContext) {
      setConfirmTitle("Error");
      setConfirmMessage("Form context not found");
      setConfirmVisible(true);
      return;
    }

    try {
      setIsSaving(true);
      const result = await formContext.submitDraftData();
      if (result.success) {
        formContext.setFullFormData([] as FormData);

        setConfirmTitle("Draft Saved!");
        setConfirmMessage("Your progress has been saved successfully.");
        setConfirmVisible(true);
      } else {
        setConfirmTitle("Error");
        setConfirmMessage("Failed to save draft.");
        setConfirmVisible(true);
        console.error(result.error);
      }
    } catch (err) {
      console.error(err);
      setConfirmTitle("Error");
      setConfirmMessage("Something went wrong while saving the draft.");
      setConfirmVisible(true);
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmVisible}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={() => setConfirmVisible(false)}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
};

export default StepContainer;
