import React, { FC, useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { ApartmentFormContext } from "@/contextStore/ApartmentFormContextType";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

const ApartmentFinalSubmitScreen: FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const context = useContext(ApartmentFormContext);
  if (!context) throw new Error("Must be used within ApartmentFormProvider");

  const { data, submitData } = context;

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    const result = await submitData();

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "Apartment listed successfully!",
      });
      setTimeout(() => router.replace("/MyListingsScreen"), 1500);
    } else {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: "Please try again later.",
      });
    }

    setLoading(false);
  };

  return (
    <View
      style={{ flex: 1, padding: 20, backgroundColor: currentTheme.background }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: currentTheme.text,
          marginBottom: 10,
        }}
      >
        Final Stage
      </Text>

      <Text
        style={{ fontSize: 16, color: currentTheme.text, marginBottom: 20 }}
      >
        Review your data and click Submit to upload your apartment listing.
      </Text>

      {/* Optional summary */}
      <View
        style={{
          padding: 15,
          backgroundColor: currentTheme.card,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontWeight: "bold", color: currentTheme.text }}>
          Title:
        </Text>
        <Text style={{ color: currentTheme.text }}>{data.title || "-"}</Text>

        <Text
          style={{
            fontWeight: "bold",
            marginTop: 10,
            color: currentTheme.text,
          }}
        >
          Address:
        </Text>
        {data.address?.map((addr, idx) => (
          <Text key={idx} style={{ color: currentTheme.text }}>
            {`${addr.street}, ${addr.aptSuiteUnit}, ${addr.city}, ${addr.stateTerritory}, ${addr.country}, ${addr.zipCode}`}
          </Text>
        ))}

        <Text
          style={{
            fontWeight: "bold",
            marginTop: 10,
            color: currentTheme.text,
          }}
        >
          Rent:
        </Text>
        <Text style={{ color: currentTheme.text }}>
          ${data.monthlyRent} / month, ${data.weeklyRent} / week
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: currentTheme.primary,
          paddingVertical: 15,
          borderRadius: 10,
          alignItems: "center",
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
            Submit
          </Text>
        )}
      </TouchableOpacity>

      {/* Progress Indicator */}
      <View
        style={{
          marginTop: 30,
          height: 10,
          width: "100%",
          backgroundColor: currentTheme.border,
          borderRadius: 5,
        }}
      >
        <View
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: currentTheme.primary,
            borderRadius: 5,
          }}
        />
      </View>

      <Toast />
    </View>
  );
};

export default ApartmentFinalSubmitScreen;
