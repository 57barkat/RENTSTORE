import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

export interface StepContainerProps {
  title?: string;
  progress?: number;
  showBack?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onDraft?: () => void;
  onPublish?: () => void;
  children: React.ReactNode;
}

const StepContainer: React.FC<StepContainerProps> = ({
  title,
  progress = 0,
  showBack = false,
  onNext,
  onBack,
  onDraft,
  onPublish,
  children,
}) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const isLastStep = progress >= 100;

  const clampedProgress = Math.min(Math.max(progress / 100, 0), 1);

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      {title && (
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {title}
        </Text>
      )}

      {/* Cross-platform progress bar */}
      <Progress.Bar
        progress={clampedProgress}
        width={null} // full width
        color={currentTheme.primary}
        borderRadius={3}
        height={6}
        borderWidth={0}
        unfilledColor="#eee"
        style={{ marginBottom: 10 }}
      />

      <View style={{ flex: 1, marginTop: 20 }}>{children}</View>

      <View style={styles.footer}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.btn, { backgroundColor: "#999" }]}
          >
            <Text style={styles.btnText}>Back</Text>
          </TouchableOpacity>
        )}

        {onDraft && !isLastStep && (
          <TouchableOpacity
            onPress={onDraft}
            style={[styles.btn, { backgroundColor: "#FFA500" }]}
          >
            <Text style={styles.btnText}>Save Draft</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={isLastStep ? onPublish : onNext}
          style={[styles.btn, { backgroundColor: currentTheme.primary }]}
        >
          <Text style={styles.btnText}>{isLastStep ? "Publish" : "Next"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});

export default StepContainer;
