import React, { useContext, useState } from "react";
import { Text, TouchableOpacity, Alert, View, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/upload";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contextStore/AuthContext";
import TierStatusBanner from "@/components/UploadPropertyComponents/TierStatusBanner";
import {
  PROPERTY_HOST_OPTIONS_CONFIG,
  PROPERTY_UPLOAD_TOTAL_STEPS,
  PropertyHostOption,
  buildDisabledReason,
} from "@/utils/propertyTypes";

const WelcomeScreen = () => {
  const formContext = useContext(FormContext);
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const { isPhoneVerified, user } = useAuth();

  const used = user?.usedPropertyCount || 0;
  const limit = user?.propertyLimit || 0;
  const credits = user?.paidPropertyCredits || 0;
  const hasAccess = used < limit || credits > 0;

  const [selectedType, setSelectedType] = useState<PropertyHostOption | null>(
    formContext?.data.hostOption ?? null,
  );

  const handleNext = () => {
    if (!hasAccess) {
      Alert.alert(
        "Limit Reached",
        "Please purchase more credits to continue uploading.",
      );
      return;
    }

    if (!selectedType) return;
    if (!isPhoneVerified) {
      Alert.alert(
        "Verification Required",
        "Please verify your phone number to upload a property.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Verify", onPress: () => router.push("/auth/VerifyPhone") },
        ],
        { cancelable: true },
      );
      return;
    }

    if (formContext) {
      formContext.updateForm("hostOption", selectedType);
      formContext.updateForm("propertyType", selectedType);
      if (selectedType === "hostel") router.push("/upload/hostelForm/Location");
      else if (selectedType === "apartment")
        router.push("/upload/apartmentForm/Location");
      else router.push("/upload/Location");
    }
  };

  const nextDisabledReason = buildDisabledReason([
    !hasAccess ? "Your upload limit has been reached. Buy more credits to continue." : undefined,
    !selectedType ? "Choose the type of property you want to upload before continuing." : undefined,
  ]);

  return (
    <StepContainer
      title="What would you like to host?"
      showBack={false}
      onNext={handleNext}
      isNextDisabled={!selectedType || !hasAccess}
      nextDisabledReason={nextDisabledReason}
      stepNumber={1}
      totalSteps={PROPERTY_UPLOAD_TOTAL_STEPS}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <TierStatusBanner />

        <View style={{ marginTop: 10, opacity: hasAccess ? 1 : 0.5 }}>
          {!hasAccess && (
            <Text
              style={{
                color: currentTheme.error,
                textAlign: "center",
                marginBottom: 10,
                fontWeight: "bold",
              }}
            >
              Upload limit reached. Upgrade your tier to continue.
            </Text>
          )}

          {!selectedType && hasAccess ? (
            <Text
              style={{
                color: currentTheme.error,
                textAlign: "center",
                marginBottom: 12,
                fontWeight: "600",
              }}
            >
              Select one property type to continue.
            </Text>
          ) : null}

          {PROPERTY_HOST_OPTIONS_CONFIG.map((option) => (
            <TouchableOpacity
              key={option.value}
              disabled={!hasAccess}
              onPress={() => setSelectedType(option.value)}
              style={[
                styles.card,
                { backgroundColor: currentTheme.card },
                selectedType === option.value && {
                  borderColor: currentTheme.primary,
                  borderWidth: 2,
                },
                !hasAccess && { borderColor: currentTheme.border },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  { color: hasAccess ? currentTheme.text : currentTheme.muted },
                ]}
              >
                {option.title}
              </Text>
              <MaterialCommunityIcons
                name={option.icon as any}
                size={60}
                color={hasAccess ? currentTheme.primary : currentTheme.muted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </StepContainer>
  );
};

export default WelcomeScreen;
