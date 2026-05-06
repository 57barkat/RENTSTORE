import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PriceRow } from "@/components/Properties/PropertyPriceCard";
import { Colors } from "@/constants/Colors";
import type { PropertyDetailData } from "@/types/PropertyDetailScreen.types";
import { formatPrice } from "@/utils/properties/formatPrice";
import { getRentDisplayOrder } from "@/utils/properties/rent";

type ThemeColors = typeof Colors.light;

interface FinancialDetailsCardProps {
  property: PropertyDetailData;
  theme: ThemeColors;
}

const RENT_LABELS = {
  monthly: "Monthly Rent",
  weekly: "Weekly Rent",
  daily: "Daily Rent",
} as const;

const isPositiveNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

export default function FinancialDetailsCard({
  property,
  theme,
}: FinancialDetailsCardProps) {
  const rentRows = getRentDisplayOrder(property)
    .map((type) => {
      const amount =
        type === "monthly"
          ? property.monthlyRent
          : type === "weekly"
            ? property.weeklyRent
            : property.dailyRent;

      if (!isPositiveNumber(amount)) {
        return null;
      }

      return {
        key: type,
        label: RENT_LABELS[type],
        value: formatPrice(amount, "Price"),
      };
    })
    .filter(Boolean) as { key: string; label: string; value: string }[];

  const rows = [...rentRows];

  if (isPositiveNumber(property.SecuritybasePrice)) {
    rows.push({
      key: "security",
      label: "Security Deposit",
      value: formatPrice(property.SecuritybasePrice, "Deposit"),
    });
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.infoCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <Ionicons
          name="wallet-outline"
          size={20}
          color={theme.primary}
        />
        <Text style={[styles.cardTitle, { color: theme.primary }]}>
          Financial Details
        </Text>
      </View>

      {rows.map((row, index) => (
        <PriceRow
          key={row.key}
          label={row.label}
          value={row.value}
          theme={theme}
          color={index === 0 ? theme.primary : theme.text}
          isLarge={index === 0}
          isLast={index === rows.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    padding: 20,
    borderRadius: 26,
    borderWidth: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
});
