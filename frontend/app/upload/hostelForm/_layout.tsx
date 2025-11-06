import React from "react";
import { Stack } from "expo-router";

export default function UploadLayout() {
  return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="IntroStep1" />
        <Stack.Screen name="Location" />
        <Stack.Screen name="CreateStep" />
        <Stack.Screen name="PropertyDetails" />
        <Stack.Screen name="AmenitiesScreen" />
        <Stack.Screen name="PhotosScreen" />
        <Stack.Screen name="ListingTitleScreen" />
        <Stack.Screen name="ListingDescriptionHighlightsScreen" />
        <Stack.Screen name="FinalDescriptionScreen" />
        <Stack.Screen name="BookingSettingsScreen" />
        <Stack.Screen name="PricingScreen" />
        <Stack.Screen name="WeekendPricingScreen" />
        <Stack.Screen name="SafetyDetailsScreen" />
        <Stack.Screen name="FinalAddressDetailsScreen" />
      </Stack>
  );
}
