import React, { useContext, useState } from "react";
import { Text, TouchableOpacity, Alert, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/upload";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contextStore/AuthContext";
import TierStatusBanner from "@/components/UploadPropertyComponents/TierStatusBanner";

const WelcomeScreen = () => {
  const formContext = useContext(FormContext);
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  // Get user data for credit check
  const { isPhoneVerified, user } = useAuth();

  // Logic: User has access if they have free slots OR paid credits
  const used = user?.usedPropertyCount || 0;
  const limit = user?.propertyLimit || 0;
  const credits = user?.paidPropertyCredits || 0;
  const hasAccess = used < limit || credits > 0;

  const [selectedType, setSelectedType] = useState<string | null>(
    formContext?.data.hostOption ?? null,
  );

  const hostOptions = [
    { title: "Home", value: "home", icon: "home-city-outline" },
    { title: "Apartment", value: "apartment", icon: "office-building-outline" },
    { title: "Hostel", value: "hostel", icon: "bed-empty" },
  ];

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
      if (selectedType === "hostel") router.push("/upload/hostelForm/Location");
      else if (selectedType === "apartment")
        router.push("/upload/apartmentForm/Location");
      else if (selectedType === "home") router.push("/upload/Location");
    }
  };

  return (
    <StepContainer
      title="What would you like to host?"
      showBack={false}
      onNext={handleNext}
      isNextDisabled={!selectedType || !hasAccess}
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

        {hostOptions.map((option) => (
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
    </StepContainer>
  );
};

export default WelcomeScreen;
