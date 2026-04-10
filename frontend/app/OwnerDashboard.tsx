import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useGetDashboardStatsQuery } from "@/services/api";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

type Listing = {
  _id: string;
  title: string;
  views: number;
  impressions: number;
  thumbnail: string;
  ctr: number;
  sortWeight: number;
};

const OwnerDashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentTheme = Colors[theme ?? "light"];
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetDashboardStatsQuery({
    page,
    limit: 10,
  });

  const totals = data?.totals;
  const listings: Listing[] = data?.data ?? [];
  const meta = data?.meta;

  const formatNum = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const sortedListings = useMemo(() => {
    return [...listings].sort((a, b) => b.sortWeight - a.sortWeight);
  }, [listings]);

  const successRate = useMemo(() => {
    if (!totals?.totalProperties) return 0;
    return Math.min(
      100,
      ((totals?.activeListings ?? 0) / totals.totalProperties) * 100,
    );
  }, [totals]);

  const chartData = useMemo(() => {
    const top = sortedListings.slice(0, 6);
    return {
      labels: top.map((item, i) => `${i + 1}`),
      datasets: [
        {
          data: top.length ? top.map((item) => item.views) : [0],
        },
      ],
    };
  }, [sortedListings]);

  const pieData = useMemo(() => {
    return [
      {
        name: "High CTR",
        population: sortedListings.filter((l) => l.ctr > 100).length,
        color: "#6366F1",
        legendFontColor: currentTheme.text,
        legendFontSize: 12,
      },
      {
        name: "Medium CTR",
        population: sortedListings.filter((l) => l.ctr > 50 && l.ctr <= 100)
          .length,
        color: "#8B5CF6",
        legendFontColor: currentTheme.text,
        legendFontSize: 12,
      },
      {
        name: "Low CTR",
        population: sortedListings.filter((l) => l.ctr <= 50).length,
        color: "#EC4899",
        legendFontColor: currentTheme.text,
        legendFontSize: 12,
      },
    ];
  }, [sortedListings, currentTheme]);

  if (isLoading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.headerContainer}>
          <View>
            <Text style={[styles.greeting, { color: currentTheme.muted }]}>
              Overview
            </Text>
            <Text style={[styles.header, { color: currentTheme.text }]}>
              Analytics
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <StatCard
            title="Total Views"
            value={formatNum(totals?.totalViews)}
            icon="eye-outline"
            color="#6366F1"
            currentTheme={currentTheme}
            isDark={isDark}
          />
          <StatCard
            title="Impressions"
            value={formatNum(totals?.totalImpressions)}
            icon="trending-up"
            color="#8B5CF6"
            currentTheme={currentTheme}
            isDark={isDark}
          />
          <StatCard
            title="Listings"
            value={totals?.totalProperties ?? 0}
            icon="home-outline"
            color="#EC4899"
            currentTheme={currentTheme}
            isDark={isDark}
          />
          <StatCard
            title="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            icon="check-decagram-outline"
            color="#10B981"
            currentTheme={currentTheme}
            isDark={isDark}
          />
        </View>

        <View
          style={[
            styles.chartContainer,
            { backgroundColor: isDark ? "#151515" : "#F9FAFB" },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Traffic Flow (Top 6 Listings Views)
          </Text>
          <LineChart
            data={chartData}
            width={screenWidth - 48}
            height={180}
            withInnerLines={false}
            withOuterLines={false}
            chartConfig={{
              backgroundColor: "transparent",
              backgroundGradientFrom: isDark ? "#151515" : "#F9FAFB",
              backgroundGradientTo: isDark ? "#151515" : "#F9FAFB",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: () => currentTheme.muted,
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#6366F1" },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View
          style={[
            styles.chartContainer,
            { backgroundColor: isDark ? "#151515" : "#F9FAFB" },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            CTR Distribution
          </Text>
          <PieChart
            data={pieData}
            width={screenWidth - 48}
            height={180}
            chartConfig={{
              color: () => currentTheme.text,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="0"
            absolute
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Top Performing
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {sortedListings.length === 0 ? (
            <Text
              style={{
                color: currentTheme.muted,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              No data available
            </Text>
          ) : (
            sortedListings.map((item) => (
              <TouchableOpacity
                key={item._id}
                onPress={() => router.push(`/property/${item._id}`)}
              >
                <View
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: isDark ? "#151515" : "#fff",
                      borderBottomColor: isDark ? "#222" : "#f0f0f0",
                    },
                  ]}
                >
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.image}
                  />
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text
                      numberOfLines={1}
                      style={[styles.itemTitle, { color: currentTheme.text }]}
                    >
                      {item.title}
                    </Text>
                    <View style={styles.itemMeta}>
                      <Text style={{ color: currentTheme.muted, fontSize: 12 }}>
                        {formatNum(item.views)} views
                      </Text>
                      <View style={styles.dot} />
                      <Text
                        style={{
                          color: "#10B981",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {item.ctr.toFixed(1)}% CTR
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={currentTheme.muted}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.pagination}>
          <TouchableOpacity
            style={[
              styles.pageBtn,
              {
                backgroundColor: isDark ? "#1f1f1f" : "#f0f0f0",
                opacity: page === 1 ? 0.5 : 1,
              },
            ]}
            disabled={page === 1}
            onPress={() => setPage((p) => p - 1)}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={currentTheme.text}
            />
          </TouchableOpacity>
          <Text style={[styles.pageText, { color: currentTheme.text }]}>
            Page {page} of {meta?.totalPages ?? 1}
          </Text>
          <TouchableOpacity
            style={[
              styles.pageBtn,
              {
                backgroundColor: isDark ? "#1f1f1f" : "#f0f0f0",
                opacity: page >= (meta?.totalPages ?? 1) ? 0.5 : 1,
              },
            ]}
            disabled={page >= (meta?.totalPages ?? 1)}
            onPress={() => setPage((p) => p + 1)}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={currentTheme.text}
            />
          </TouchableOpacity>
        </View>

        {isFetching && (
          <ActivityIndicator style={{ marginTop: 10 }} color="#6366F1" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ title, value, icon, color, currentTheme, isDark }: any) => (
  <View
    style={[
      styles.stat,
      {
        backgroundColor: isDark ? "#151515" : "#fff",
        shadowColor: isDark ? "#000" : "#999",
      },
    ]}
  >
    <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <Text style={[styles.statValue, { color: currentTheme.text }]}>
      {value}
    </Text>
    <Text style={[styles.statTitle, { color: currentTheme.muted }]}>
      {title}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  header: { fontSize: 28, fontWeight: "800" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  stat: {
    width: "47%",
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statTitle: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  chartContainer: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 24,
    marginTop: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  chart: { borderRadius: 16, marginLeft: -16 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  image: { width: 52, height: 52, borderRadius: 14, marginRight: 15 },
  itemTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  itemMeta: { flexDirection: "row", alignItems: "center" },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    alignItems: "center",
    gap: 20,
  },
  pageBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  pageText: { fontWeight: "600", fontSize: 14 },
});

export default OwnerDashboard;
