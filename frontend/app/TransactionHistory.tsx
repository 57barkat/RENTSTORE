import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useGetPaymentHistoryQuery } from "@/services/api";
import { useTheme } from "@/contextStore/ThemeContext";

const TransactionHistoryScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentTheme = Colors[isDark ? "dark" : "light"];

  const {
    data: history,
    isLoading,
    isFetching,
    refetch,
  } = useGetPaymentHistoryQuery();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.border,
        },
      ]}
    >
      <View style={styles.cardRow}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: currentTheme.primary + "15" },
          ]}
        >
          <Ionicons
            name="receipt-outline"
            size={20}
            color={currentTheme.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.packageLabel, { color: currentTheme.text }]}>
            {item.package.replace("_", " ").toUpperCase()}
          </Text>
          <Text style={[styles.subText, { color: currentTheme.muted }]}>
            {formatDate(item.date)} •{" "}
            {item.method === "Unknown" ? "SafePay" : item.method}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.amount, { color: currentTheme.text }]}>
            Rs {item.amount}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: currentTheme.success + "15" },
            ]}
          >
            <Text style={[styles.badgeText, { color: currentTheme.success }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          Transactions
        </Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={currentTheme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons
              name="card-outline"
              size={50}
              color={currentTheme.muted}
            />
            <Text style={{ color: currentTheme.muted, marginTop: 10 }}>
              No history found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: "800" },
  list: { padding: 20, paddingTop: 0 },
  card: {
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardRow: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  packageLabel: { fontSize: 15, fontWeight: "700" },
  subText: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "800" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
});

export default TransactionHistoryScreen;
