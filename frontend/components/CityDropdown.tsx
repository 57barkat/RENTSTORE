import React from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type ThemeColors = {
  primary: string;
  text: string;
  muted: string;
  card: string;
  border: string;
};

type Props = {
  visible: boolean;
  items: string[];
  onSelect: (city: string) => void;
  currentTheme: ThemeColors;
  style?: any;
  maxHeightPercent?: number; // fraction of screen height, default 0.3
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function CityDropdown({
  visible,
  items,
  onSelect,
  currentTheme,
  style,
  maxHeightPercent = 0.3,
}: Props) {
  if (!visible || items.length === 0) return null;

  return (
    <View
      style={[
        styles.dropdown,
        {
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.border,
          shadowColor: currentTheme.text,
          maxHeight: SCREEN_HEIGHT * maxHeightPercent,
        },
        style,
      ]}
    >
      <FlatList
        data={items}
        keyExtractor={(i) => i}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemRow]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Feather
              name="map-pin"
              size={16}
              color={currentTheme.muted}
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.itemText, { color: currentTheme.text }]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 8,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginHorizontal: 20,
  },
  itemRow: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
