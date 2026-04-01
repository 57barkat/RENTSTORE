import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PriceRow } from "@/components/Properties/PropertyPriceCard";
import { formatPrice } from "@/utils/properties/formatPrice";

export default function FinancialDetailsCard({ property, theme }: any) {
  return (
    <View
      style={[
        styles.infoCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <Ionicons
          name="shield-checkmark-outline"
          size={20}
          color={theme.secondary}
        />
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          FINANCIAL DETAILS
        </Text>
      </View>
      <PriceRow
        label="Monthly Rent"
        value={formatPrice(property.monthlyRent, "not available")}
        theme={theme}
        color={theme.secondary}
        isLarge
      />
      <PriceRow
        label="Weekly Rate"
        value={formatPrice(property.weeklyRent, "not available")}
        theme={theme}
      />
      <PriceRow
        label="Daily Rate"
        value={formatPrice(property.dailyRent, "not available")}
        theme={theme}
      />
      <PriceRow
        label="Security Deposit"
        value={formatPrice(property.SecuritybasePrice, "no deposit")}
        theme={theme}
        isLast
      />
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 12, fontWeight: "800" },
});
