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

const packages = [
  {
    id: "single",
    title: "Single Slot",
    credits: "1 Property Upload",
    price: "RS 300",
    description: "Quick one-time upload.",
    icon: "numeric-1-circle-outline",
  },
  {
    id: "standard",
    title: "Standard Pack",
    credits: "5 Property Uploads",
    price: "RS 1,200",
    description: "Best for homeowners.",
    icon: "layers-triple-outline",
    popular: true,
  },
  {
    id: "business_pro",
    title: "Business Pro",
    credits: "20 Uploads + 5 Featured",
    price: "RS 5,500",
    description: "Ultimate agent toolkit.",
    icon: "shield-star-outline",
  },
];

const BuyCredits = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState("standard");
  const { handlePayment, loading } = usePayment();

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
          Expand your reach
        </Text>

        {packages.map((pkg) => {
          const isSelected = selectedTier === pkg.id;
          const isPro = pkg.id === "business_pro";
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
                    ? isPro
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
                      backgroundColor: isPro
                        ? currentTheme.accent + "15"
                        : currentTheme.primary + "10",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={pkg.icon as any}
                    size={26}
                    color={isPro ? currentTheme.accent : currentTheme.primary}
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
                        color: isPro
                          ? currentTheme.accent
                          : currentTheme.primary,
                      },
                    ]}
                  >
                    {pkg.credits}
                  </Text>
                </View>
                <Text style={[styles.cardPrice, { color: currentTheme.text }]}>
                  {pkg.price}
                </Text>
              </View>

              <Text style={[styles.cardDesc, { color: currentTheme.muted }]}>
                {pkg.description}
              </Text>

              {isSelected && <PackageBenefits packageId={pkg.id} />}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: currentTheme.primary }]}
          onPress={() => handlePayment(selectedTier)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payButtonText}>Proceed to Payment</Text>
          )}
        </TouchableOpacity>
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
});

export default BuyCredits;
