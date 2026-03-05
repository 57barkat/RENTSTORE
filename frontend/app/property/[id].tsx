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
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import ImageCarousel from "@/utils/properties/Carousel";
import { formatPrice } from "@/utils/properties/formatPrice";
import { usePropertyById } from "@/services/propertyService";
import { useChatRoom } from "@/hooks/useChatRoom";

import { PropertyDetailsHeader } from "@/components/Properties/PropertyDetailsHeader";
import { StatItem } from "@/components/Properties/PropertyStats";
import { Badge } from "@/components/Properties/PropertyBadge";
import { PriceRow } from "@/components/Properties/PropertyPriceCard";
import { PropertyFooter } from "@/components/Properties/PropertyFooter";

import { Ionicons } from "@expo/vector-icons";
import { FontSize } from "@/constants/Typography";
import { usePropertyReportMutation } from "@/services/api";

export const options = { headerShown: false };

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log("PropertyDetails rendered with id:", id);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const isDark = theme === "dark";
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();

  // Reporting State
  const [isModalVisible, setModalVisible] = useState(false);
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

  const fullAddress = property.address?.[0]
    ? `${property.address[0].street}, ${property.address[0].city}, ${property.address[0].stateTerritory}`
    : property.location;

  const handleMapRedirect = () => {
    if (property.lat && property.lng) {
      const url = Platform.select({
        ios: `maps:0,0?q=${property.title}@${property.lat},${property.lng}`,
        android: `geo:0,0?q=${property.lat},${property.lng}(${property.title})`,
      });
      if (url) Linking.openURL(url);
    }
  };

  const reasons = ["SCAM", "RENTED", "INCORRECT_DATA", "OFFENSIVE", "OTHER"];

  const submitReport = async () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason for reporting.");
      return;
    }
    try {
      await reportProperty({
        propertyId: id,
        reason: selectedReason,
        description:
          reportDescription ||
          `User reported this property as ${selectedReason.toLowerCase()}`,
      }).unwrap();

      setModalVisible(false);
      setSelectedReason("");
      setReportDescription("");
      Alert.alert(
        "Success",
        "Thank you for your report. Our team will review this listing.",
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit report. Please try again later.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <PropertyDetailsHeader
        theme={currentTheme}
        isDark={isDark}
        onBack={() => router.back()}
      />

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
              property.photos?.map((uri: string) => ({ uri, type: "image" })) ||
              []
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
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.reportButton}
          >
            <Ionicons
              name="flag-outline"
              size={18}
              color={currentTheme.muted}
            />
            <Text style={[styles.reportText, { color: currentTheme.muted }]}>
              Report this property
            </Text>
          </TouchableOpacity>
          <Text style={[styles.tagline, { color: currentTheme.primary }]}>
            {property.hostOption?.toUpperCase()} •{" "}
            {property.featured ? "FEATURED" : "VERIFIED"}
          </Text>

          <Text style={[styles.title, { color: currentTheme.text }]}>
            {property.title}
          </Text>

          <TouchableOpacity
            onPress={handleMapRedirect}
            style={styles.locationRow}
          >
            <Ionicons name="location" size={18} color={currentTheme.primary} />
            <Text style={[styles.locationText, { color: currentTheme.muted }]}>
              {fullAddress}
            </Text>
          </TouchableOpacity>

          <View style={styles.statsContainer}>
            <StatItem
              icon={
                property.capacityState?.floorLevel === 0
                  ? "office-building"
                  : "layers-triple"
              }
              label="Floor"
              value={
                property.capacityState?.floorLevel === 0
                  ? "Ground"
                  : property.capacityState?.floorLevel
              }
              theme={currentTheme}
            />
            <StatItem
              icon="bed-outline"
              label="Beds"
              value={property.capacityState?.bedrooms}
              theme={currentTheme}
            />
            <StatItem
              icon="shower-head"
              label="Baths"
              value={property.capacityState?.bathrooms}
              theme={currentTheme}
            />
          </View>
          <View
            style={[styles.divider, { backgroundColor: currentTheme.border }]}
          />

          {/* Owner Profile Section */}
          {property.owner && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                Hosted by
              </Text>
              <View style={styles.ownerCard}>
                <Image
                  source={{ uri: property.owner.profileImage }}
                  style={styles.ownerImage}
                />
                <View>
                  <Text
                    style={[styles.ownerName, { color: currentTheme.text }]}
                  >
                    {property.owner.name}
                  </Text>
                  <Text style={{ color: currentTheme.muted }}>
                    Property Owner
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Highlights */}
          {property.description?.highlighted && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                Highlights
              </Text>
              <View style={styles.badgeGrid}>
                {property.description.highlighted.map(
                  (h: string, i: number) => (
                    <Badge
                      key={i}
                      text={h.replace("_", " ")}
                      icon="star-face"
                      theme={currentTheme}
                      type="highlight"
                    />
                  ),
                )}
              </View>
            </View>
          )}

          {/* Amenities & Bills */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Amenities & Bills
            </Text>
            <View style={styles.badgeGrid}>
              {property.amenities?.map((item: string, i: number) => (
                <Badge
                  key={`amenity-${i}`}
                  text={item}
                  icon="check-circle-outline"
                  theme={currentTheme}
                  type="amenity"
                />
              ))}
              {property.ALL_BILLS?.map((bill: string, i: number) => (
                <Badge
                  key={`bill-${i}`}
                  text={`${bill} included`}
                  icon="flash-outline"
                  theme={currentTheme}
                  type="safety"
                />
              ))}
            </View>
          </View>

          {/* Financials */}
          <View
            style={[
              styles.priceCard,
              {
                borderColor: currentTheme.border,
                backgroundColor: currentTheme.card,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: currentTheme.text, marginBottom: 12 },
              ]}
            >
              Financial Details
            </Text>
            <PriceRow
              label="Monthly Rent"
              value={formatPrice(
                property.monthlyRent,
                "not available for monthly rent",
              )}
              theme={currentTheme}
              isLarge
              color={currentTheme.primary}
            />
            <PriceRow
              label="Weekly Rate"
              value={formatPrice(
                property.weeklyRent,
                "not available for weekly rent",
              )}
              theme={currentTheme}
            />
            <PriceRow
              label="Daily Rate"
              value={formatPrice(
                property.dailyRent,
                "not available for daily rent",
              )}
              theme={currentTheme}
            />
            <PriceRow
              label="Security Deposit"
              value={formatPrice(
                property.SecuritybasePrice,
                "no security deposit",
              )}
              theme={currentTheme}
              isLast
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Report Property
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={currentTheme.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: currentTheme.muted }]}>
              Select a Reason
            </Text>
            <View style={styles.reasonContainer}>
              {reasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  style={[
                    styles.reasonBadge,
                    {
                      borderColor:
                        selectedReason === reason
                          ? currentTheme.primary
                          : currentTheme.border,
                      backgroundColor:
                        selectedReason === reason
                          ? `${currentTheme.primary}20`
                          : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        selectedReason === reason
                          ? currentTheme.primary
                          : currentTheme.text,
                      fontWeight: selectedReason === reason ? "700" : "400",
                    }}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.modalLabel,
                { color: currentTheme.muted, marginTop: 15 },
              ]}
            >
              Additional Details (Optional)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: currentTheme.text,
                  borderColor: currentTheme.border,
                  backgroundColor: isDark ? "#1A1A1A" : "#F9F9F9",
                },
              ]}
              multiline
              numberOfLines={4}
              placeholder="Tell us more about the problem..."
              placeholderTextColor={currentTheme.muted}
              value={reportDescription}
              onChangeText={setReportDescription}
            />

            <TouchableOpacity
              onPress={submitReport}
              disabled={isReporting}
              style={[
                styles.submitButton,
                { backgroundColor: currentTheme.primary },
              ]}
            >
              {isReporting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {property.chat && (
        <PropertyFooter
          theme={currentTheme}
          price={formatPrice(property.monthlyRent, "Monthly")}
          onChat={handleChatOwner}
          isCreating={isCreating}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentCard: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
    opacity: 0.2,
  },
  tagline: {
    fontSize: FontSize.sm,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    fontSize: FontSize.sm,
    marginLeft: 6,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  divider: {
    height: 1,
    marginVertical: 25,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    marginBottom: 15,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priceCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ownerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ownerName: {
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 30,
    paddingBottom: 20,
  },
  reportText: {
    marginLeft: 8,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
    minHeight: 450,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  modalLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    marginBottom: 10,
  },
  reasonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  reasonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    marginBottom: 20,
  },
  submitButton: {
    borderRadius: 15,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: FontSize.base,
    fontWeight: "700",
  },
});
