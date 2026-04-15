"use client";
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Linking as NativeLinking,
  Share,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as ExpoLinking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { usePropertyById } from "@/services/propertyService";
import { useChatRoom } from "@/hooks/useChatRoom";
import { usePropertyReportMutation } from "@/services/api";
import { PropertyDetailsHeader } from "@/components/Properties/PropertyDetailsHeader";
import ImageCarousel from "@/utils/properties/Carousel";
import PropertyInfoSection from "@/components/PropertyInfoSection";
import FinancialDetailsCard from "@/components/FinancialDetailsCard";
import OwnerSection from "@/components/OwnerSection";
import ReportModal from "@/components/ReportModal";
import { useAuth } from "@/contextStore/AuthContext";
import AuthModal from "@/components/AuthModal";
import { formatPhoneForWhatsApp } from "@/utils/properties/formatProperties";
import { useTrackView } from "@/hooks/useTrackView";

export const options = { headerShown: false };

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = Array.isArray(id) ? id[0] : id;
  const shareBaseUrl = process.env.EXPO_PUBLIC_SHARE_BASE_URL?.replace(
    /\/$/,
    "",
  );
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const isDark = theme === "dark";
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const { isGuest, user } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  useTrackView(propertyId);
  const { property, isLoading, refetch, isFetching } =
    usePropertyById(propertyId);
  const isOwner = user?.id === property?.ownerId;

  const propertyPath = propertyId ? `/property/${propertyId}` : "";
  const shareUrl = propertyPath
    ? shareBaseUrl
      ? `${shareBaseUrl}${propertyPath}`
      : ExpoLinking.createURL(propertyPath, {
          scheme: "anganstay",
        })
    : "";

  const { handleChatOwner, isCreating } = useChatRoom(
    property?.ownerId,
    property?.owner?.name,
    property?.owner?.profileImage,
  );

  const [
    ,
    // reportProperty
    { isLoading: isReporting },
  ] = usePropertyReportMutation();

  const onPressChat = () => {
    if (isGuest) {
      setAuthModalVisible(true);
    } else {
      handleChatOwner();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${property?.title} on Rent Store!\n${shareUrl}`,
        url: shareUrl,
        title: property?.title,
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleWhatsApp = () => {
    if (!property?.owner?.phone) {
      Alert.alert("Error", "Owner phone number not available.");
      return;
    }

    const phone = formatPhoneForWhatsApp(property.owner.phone);
    const locationText = property.location || "No address provided";
    const message =
      `Hi, I'm interested in your property:\n\n` +
      `*${property.title}*\n` +
      `Location: ${locationText}\n\n` +
      `Link: ${shareUrl}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    NativeLinking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open WhatsApp.");
    });
  };

  const handleMapRedirect = () => {
    if (property?.lat && property?.lng) {
      const url = Platform.select({
        ios: `maps:0,0?q=${property.title}@${property.lat},${property.lng}`,
        android: `geo:0,0?q=${property.lat},${property.lng}(${property.title})`,
      });

      if (url) {
        NativeLinking.openURL(url);
      }
    }
  };

  if (isLoading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  if (!property) return null;

  const showWhatsApp = property.owner?.subscription !== "free";

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.headerWrapper}>
        <PropertyDetailsHeader
          theme={currentTheme}
          isDark={isDark}
          onBack={() => router.back()}
          onShare={handleShare}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={currentTheme.primary}
          />
        }
      >
        <View style={{ height: windowHeight * 0.45 }}>
          <ImageCarousel
            media={
              property.photos?.map((uri: string, index: number) => ({
                uri,
                type: "image",
                id: `img-${index}`,
              })) || []
            }
          />
        </View>

        <View
          style={[
            styles.contentCard,
            { backgroundColor: currentTheme.background },
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: currentTheme.border }]}
          />

          <PropertyInfoSection
            property={property}
            theme={currentTheme}
            onNavigate={handleMapRedirect}
          />

          <FinancialDetailsCard property={property} theme={currentTheme} />

          <ReportModal
            visible={isModalVisible}
            setVisible={setModalVisible}
            theme={currentTheme}
            isDark={isDark}
            selectedReason={selectedReason}
            setSelectedReason={setSelectedReason}
            reportDescription={reportDescription}
            setReportDescription={setReportDescription}
            onSubmit={() => {}}
            isReporting={isReporting}
          />
        </View>
      </ScrollView>

      {showWhatsApp && (
        <TouchableOpacity
          style={styles.whatsappSticky}
          onPress={handleWhatsApp}
          activeOpacity={0.9}
        >
          <Ionicons name="logo-whatsapp" size={32} color="#FFF" />
        </TouchableOpacity>
      )}

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        featureName="Messaging"
      />

      <OwnerSection
        owner={property.owner}
        theme={currentTheme}
        onChat={onPressChat}
        isCreating={isCreating}
        price={property.monthlyRent}
        isOwner={isOwner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  contentCard: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 500,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
    opacity: 0.2,
  },
  whatsappSticky: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#25D366",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 999,
  },
});
