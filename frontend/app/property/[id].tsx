import React, { useState } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Linking,
  Share,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export const options = { headerShown: false };

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const isDark = theme === "dark";
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const { isGuest } = useAuth();

  const [isModalVisible, setModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const { property, isLoading, refetch, isFetching } = usePropertyById(id);

  const { handleChatOwner, isCreating } = useChatRoom(
    property?.ownerId,
    property?.owner?.name,
    property?.owner?.profileImage,
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
      const shareUrl = `https://expo.dev/@usman_naeem/rent-store?id=${id}`;
      await Share.share({
        message: `Check out ${property?.title} on Rent Store!\n${shareUrl}`,
        url: shareUrl,
        title: property?.title,
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleMapRedirect = () => {
    if (property?.lat && property?.lng) {
      const url = Platform.select({
        ios: `maps:0,0?q=${property.title}@${property.lat},${property.lng}`,
        android: `geo:0,0?q=${property.lat},${property.lng}(${property.title})`,
      });
      if (url) Linking.openURL(url);
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

      {/* ✅ Feature Restriction Modal */}
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
});
