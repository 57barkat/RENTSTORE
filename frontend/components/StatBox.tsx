import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatBoxProps {
  label: string;
  value: number;
  color: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, color }) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statBox: { alignItems: "center", minWidth: 80 },
  statValue: { fontSize: 12, fontWeight: "800" },
  statLabel: { fontSize: 12, color: "#777", marginTop: 2 },
});

export default StatBox;
