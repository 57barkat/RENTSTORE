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
} from "react-native";
import * as ExpoLinking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { usePropertyById } from "@/services/propertyService";
import { useChatRoom } from "@/hooks/useChatRoom";
import { usePropertyReportMutation } from "@/services/api";
import ListedByCard from "@/components/ListedByCard";
import { PropertyDetailsHeader } from "@/components/Properties/PropertyDetailsHeader";
import StickyActionBar from "@/components/StickyActionBar";
import ImageCarousel from "@/utils/properties/Carousel";
import PropertyInfoSection from "@/components/PropertyInfoSection";
import FinancialDetailsCard from "@/components/FinancialDetailsCard";
import ReportModal from "@/components/ReportModal";
import { useAuth } from "@/contextStore/AuthContext";
import AuthModal from "@/components/AuthModal";
import { formatPhoneForWhatsApp } from "@/utils/properties/formatProperties";
import type { PropertyDetailData } from "@/types/PropertyDetailScreen.types";
import { useTrackView } from "@/hooks/useTrackView";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const { isGuest, user } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  useTrackView(propertyId);
  const { property, isLoading, refetch, isFetching } =
    usePropertyById(propertyId);
  const details = property as PropertyDetailData | undefined;
  const isOwner = user?.id === details?.ownerId;

  const propertyPath = propertyId ? `/property/${propertyId}` : "";
  const shareUrl = propertyPath
    ? shareBaseUrl
      ? `${shareBaseUrl}${propertyPath}`
      : ExpoLinking.createURL(propertyPath, {
          scheme: "anganstay",
        })
    : "";

  const { handleChatOwner, isCreating } = useChatRoom(
    details?.ownerId,
    details?.owner?.name,
    details?.owner?.profileImage,
  );

  const [reportProperty, { isLoading: isReporting }] =
    usePropertyReportMutation();

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
        message: `Check out ${details?.title} on Rent Store!\n${shareUrl}`,
        url: shareUrl,
        title: details?.title,
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleWhatsApp = () => {
    if (!details?.owner?.phone) {
      Alert.alert("Error", "Owner phone number not available.");
      return;
    }

    const phone = formatPhoneForWhatsApp(details.owner.phone);
    const locationText =
      details.addressQuery ||
      details.area ||
      details.location ||
      details.address?.[0]?.city ||
      "No address provided";
    const message =
      `Hi, I'm interested in your property:\n\n` +
      `*${details.title || "Property"}*\n` +
      `Location: ${locationText}\n\n` +
      `Link: ${shareUrl}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    NativeLinking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open WhatsApp.");
    });
  };

  const handleMapRedirect = () => {
    if (typeof details?.lat === "number" && typeof details?.lng === "number") {
      const url = Platform.select({
        ios: `maps:0,0?q=${details.title || "Property"}@${details.lat},${details.lng}`,
        android: `geo:0,0?q=${details.lat},${details.lng}(${details.title || "Property"})`,
      });

      if (url) {
        NativeLinking.openURL(url);
      }
    }
  };

  const handleCall = () => {
    if (!details?.owner?.phone) {
      Alert.alert("Error", "Owner phone number not available.");
      return;
    }

    NativeLinking.openURL(`tel:${details.owner.phone}`).catch(() => {
      Alert.alert("Error", "Unable to open your dialer.");
    });
  };

  const handleReportSubmit = async () => {
    if (isGuest) {
      setModalVisible(false);
      setAuthModalVisible(true);
      return;
    }

    if (!selectedReason) {
      Alert.alert("Report", "Please choose a reason first.");
      return;
    }

    if (!propertyId) {
      Alert.alert("Report", "Unable to identify this property.");
      return;
    }

    try {
      await reportProperty({
        propertyId,
        reason: selectedReason,
        description: reportDescription.trim() || undefined,
      }).unwrap();
      setModalVisible(false);
      setSelectedReason("");
      setReportDescription("");
      Alert.alert(
        "Report submitted",
        "Thanks. Our team will review this listing. If it violates AnganStay rules, we may remove it or contact the owner.",
      );
    } catch (error: any) {
      Alert.alert(
        "Report failed",
        error?.data?.message || "Unable to submit your report right now.",
      );
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

  if (!details) return null;

  const showWhatsApp =
    Boolean(details.owner?.phone) && details.owner?.subscription !== "free";
  const heroHeight = Math.min(windowHeight * 0.43, 360);

  return (
    <View style={[styles.screen, { backgroundColor: currentTheme.background }]}>
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
          onReport={() => setModalVisible(true)}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={currentTheme.primary}
          />
        }
      >
        <View style={styles.heroWrap}>
          <ImageCarousel
            media={
              details.photos?.map((uri: string, index: number) => ({
                uri,
                type: "image",
                id: `img-${index}`,
              })) || []
            }
            height={heroHeight}
            counterPlacement="top-right"
            topInset={insets.top + 8}
          />
        </View>

        <View
          style={[
            styles.contentCard,
            {
              backgroundColor: currentTheme.background,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <PropertyInfoSection
            property={details}
            theme={currentTheme}
            onNavigate={handleMapRedirect}
          />

          <FinancialDetailsCard property={details} theme={currentTheme} />

          <ListedByCard
            propertyId={propertyId}
            owner={details.owner}
            theme={currentTheme}
          />

          <ReportModal
            visible={isModalVisible}
            setVisible={setModalVisible}
            theme={currentTheme}
            isDark={isDark}
            selectedReason={selectedReason}
            setSelectedReason={setSelectedReason}
            reportDescription={reportDescription}
            setReportDescription={setReportDescription}
            onSubmit={handleReportSubmit}
            isReporting={isReporting}
          />
        </View>
      </ScrollView>

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        featureName="Messaging"
      />

      <StickyActionBar
        theme={currentTheme}
        onCall={handleCall}
        onChat={onPressChat}
        onWhatsApp={handleWhatsApp}
        canCall={!isOwner && Boolean(details.owner?.phone)}
        canChat={!isOwner && Boolean(details.ownerId)}
        canWhatsApp={!isOwner && showWhatsApp}
        chatLoading={isCreating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  heroWrap: {
    backgroundColor: "#0F172A",
  },
  contentCard: {
    marginTop: -18,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
    minHeight: 500,
    gap: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 5,
  },
});
