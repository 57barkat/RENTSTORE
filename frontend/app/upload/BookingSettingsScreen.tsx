import React, { useState, FC } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/BookingSettingsScreen";
import { BookingSetting } from "@/types/BookingSettingsScreen.types";
import { SettingCard } from "@/components/UploadPropertyComponents/SettingCard";

const BookingSettingsScreen: FC = () => {
  const router = useRouter();
  const [selectedSetting, setSelectedSetting] = useState<BookingSetting | null>(
    null
  );

  const handleSelectSetting = (setting: BookingSetting) => {
    setSelectedSetting(setting);
  };

  const handleNext = () => {
    if (selectedSetting) {
      console.log("Booking Setting saved:", selectedSetting);
      router.push("/upload/PricingScreen");
    }
  };

  const isNextDisabled = selectedSetting === null;

  return (
    <StepContainer
      title="Pick your booking settings"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={73}
    >
      {/* <Text style={styles.subtitle}>
        You can change this at any time.{" "}
        <Text style={styles.link}>Learn more</Text>
      </Text> */}

      <View style={styles.optionsContainer}>
        <SettingCard
          setting="manual"
          title="Approve your first 5 bookings"
          subtitle="Start by reviewing reservation requests, then switch to Instant Book, so persons can book automatically."
          iconName="calendar-check"
          isSelected={selectedSetting === "manual"}
          recommended={true}
          onSelect={handleSelectSetting}
        />
        <SettingCard
          setting="instant"
          title="Use Instant Book"
          subtitle="Let persons book automatically."
          iconName="flash-auto"
          isSelected={selectedSetting === "instant"}
          onSelect={handleSelectSetting}
        />
      </View>
    </StepContainer>
  );
};

export default BookingSettingsScreen;
