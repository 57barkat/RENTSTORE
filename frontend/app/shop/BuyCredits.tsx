import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { usePayment } from "@/hooks/usePayment";
import { PackageBenefits } from "@/components/Shop/PackageBenefits";

interface Package {
  id: "free" | "standard" | "pro" | "featured_boost";
  title: string;
  credits: string;
  price: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isFree?: boolean;
  popular?: boolean;
  isAddon?: boolean;
}

const packages: Package[] = [
  {
    id: "free",
    title: "Free Listing",
    credits: "3 Uploads / Month",
    price: "FREE",
    description: "Perfect for testing the waters.",
    icon: "leaf",
    isFree: true,
  },
  {
    id: "standard",
    title: "Starter Pack",
    credits: "10 Listings + 2 Priority",
    price: "RS 1,500",
    description: "Best for individual landlords.",
    icon: "rocket-launch-outline",
    popular: true,
  },
  {
    id: "pro",
    title: "Pro Package",
    credits: "40 Listings + 8 Priority",
    price: "RS 4,000",
    description: "For serious agents & agencies.",
    icon: "crown-outline",
  },
  {
    id: "featured_boost",
    title: "Featured Only",
    credits: "Single Property Boost",
    price: "RS 800",
    description: "Get 10x more views on one listing.",
    icon: "lightning-bolt-outline",
    isAddon: true,
  },
];

const BuyCredits = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<Package["id"]>("standard");
  const { handlePayment, loading } = usePayment();

  const handleAction = () => {
    if (selectedTier === "free") {
      router.replace("/(tabs)/profile");
      return;
    }
    handlePayment(selectedTier);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: currentTheme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={currentTheme.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          Membership Tiers
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: currentTheme.text }]}>
          Choose your plan
        </Text>

        {packages.map((pkg) => {
          const isSelected = selectedTier === pkg.id;
          const isProTier = pkg.id === "pro";
          const isFeaturedAddon = pkg.id === "featured_boost";

          return (
            <TouchableOpacity
              key={pkg.id}
              activeOpacity={0.8}
              onPress={() => setSelectedTier(pkg.id)}
              style={[
                styles.card,
                {
                  backgroundColor: currentTheme.card,
                  borderColor: isSelected
                    ? isProTier
                      ? currentTheme.accent
                      : currentTheme.primary
                    : currentTheme.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              {pkg.popular && (
                <View
                  style={[
                    styles.popularBadge,
                    { backgroundColor: currentTheme.primary },
                  ]}
                >
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}

              <View style={styles.cardRow}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isProTier
                        ? currentTheme.accent + "15"
                        : isFeaturedAddon
                          ? "#EAB30820"
                          : currentTheme.primary + "10",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={pkg.icon}
                    size={26}
                    color={
                      isProTier
                        ? currentTheme.accent
                        : isFeaturedAddon
                          ? "#EAB308"
                          : currentTheme.primary
                    }
                  />
                </View>

                <View style={styles.infoBox}>
                  <Text
                    style={[styles.cardTitle, { color: currentTheme.text }]}
                  >
                    {pkg.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardCredits,
                      {
                        color: isProTier
                          ? currentTheme.accent
                          : currentTheme.primary,
                      },
                    ]}
                  >
                    {pkg.credits}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[styles.cardPrice, { color: currentTheme.text }]}
                  >
                    {pkg.price}
                  </Text>
                  {!pkg.isAddon && !pkg.isFree && (
                    <Text style={{ fontSize: 10, color: currentTheme.muted }}>
                      /month
                    </Text>
                  )}
                </View>
              </View>

              <Text style={[styles.cardDesc, { color: currentTheme.muted }]}>
                {pkg.description}
              </Text>

              {isSelected && <PackageBenefits packageId={pkg.id} />}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.payButton,
            {
              backgroundColor:
                selectedTier === "free"
                  ? currentTheme.muted
                  : currentTheme.primary,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={handleAction}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payButtonText}>
              {selectedTier === "free"
                ? "Continue with Free"
                : "Proceed to Payment"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerNote, { color: currentTheme.muted }]}>
          All plans include basic dashboard access and 24/7 automated support.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "900", marginBottom: 20 },
  card: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 16,
  },
  popularText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: { flex: 1, marginLeft: 14 },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  cardCredits: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  cardPrice: { fontSize: 19, fontWeight: "800" },
  cardDesc: { fontSize: 12, lineHeight: 18, opacity: 0.8 },
  payButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  payButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  footerNote: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 20,
    lineHeight: 16,
  },
});

export default BuyCredits;
