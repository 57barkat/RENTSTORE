import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { styles } from "@/styles/HostelForm.styles";

interface NavigationProps {
  step: number;
  handleNext: () => void;
  handlePrev: () => void;
  handleSubmit: () => void;
  handleSaveDraft: () => void;
  isStepValid: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  step,
  handleNext,
  handlePrev,
  handleSubmit,
  handleSaveDraft,
  isStepValid,
}) => {
  const currentTheme = Colors.light; // Replace with dynamic theme if needed

  return (
    <View
      style={[
        styles.navigationContainer,
        {
          borderColor: currentTheme.border,
          backgroundColor: currentTheme.card,
        },
      ]}
    >
      <View style={styles.navigationRow}>
        <TouchableOpacity
          style={[
            styles.draftButton,
            {
              backgroundColor: currentTheme.secondary,
              borderColor: currentTheme.border,
            },
          ]}
          onPress={handleSaveDraft}
        >
          <FontAwesome
            name="save"
            size={16}
            color="#fff"
            style={{ marginRight: 5 }}
          />
          <Text style={styles.navButtonText}>Save Draft</Text>
        </TouchableOpacity>

        <View style={styles.stepNavContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={[
                styles.navButton,
                { backgroundColor: currentTheme.secondary, marginRight: 8 },
              ]}
              onPress={handlePrev}
            >
              <FontAwesome
                name="arrow-left"
                size={16}
                color="#fff"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 6 ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                {
                  backgroundColor: isStepValid
                    ? currentTheme.primary
                    : currentTheme.muted,
                  opacity: isStepValid ? 1 : 0.6,
                },
              ]}
              onPress={handleNext}
              disabled={!isStepValid}
            >
              <Text style={styles.navButtonText}>Next</Text>
              <FontAwesome
                name="arrow-right"
                size={16}
                color="#fff"
                style={{ marginLeft: 5 }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.navButton,
                {
                  backgroundColor: isStepValid
                    ? currentTheme.success
                    : currentTheme.muted,
                  opacity: isStepValid ? 1 : 0.6,
                },
              ]}
              onPress={handleSubmit}
              disabled={!isStepValid}
            >
              <Text style={styles.navButtonText}>Submit Listing</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
