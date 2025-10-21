import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/Welcome";
import { StepContainerProps } from "@/types/Welcome.types";



const StepContainer: React.FC<StepContainerProps> = ({
  title,
  showBack = true,
  children,
  onNext,
  isNextDisabled = false,
  progress = 0,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (showBack) router.back();
  };

  const handleExit = () => {
    router.replace("/homePage"); // or another route like '/welcome'
  };

  // Change button text to "Finish" if progress is 100
  const nextButtonText = progress >= 100 ? "Finish" : "Next";

  return (
    <SafeAreaView style={styles.fullScreen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.headerButton}>
          <Text style={styles.headerText}>Exit</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => console.log("Questions clicked")}
          style={[styles.headerButton, { right: 70 }]}
        >
          <Text style={styles.headerText}>Questions?</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        {children}
      </View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <View style={[styles.progressBarContainer]}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        <View style={styles.navBar}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <TouchableOpacity
            onPress={onNext}
            style={[
              styles.nextButton,
              isNextDisabled && styles.disabledNextButton,
            ]}
            disabled={isNextDisabled}
          >
            <Text style={styles.nextButtonText}>{nextButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StepContainer;
