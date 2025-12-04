import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";

const SCREEN_WIDTH = Dimensions.get("window").width;

const propertyTypes = ["Hostel", "Apartment", "Home"];
const dummyCities = ["Islamabad", "Karachi", "Lahore", "Peshawar", "Quetta"];

interface HeroSearchProps {
  onSearch: (city: string, type: string) => void;
  onViewAll: () => void;
}

export default function HeroSearch({ onSearch, onViewAll }: HeroSearchProps) {
  const { theme } = useTheme();
  const colors = theme === "light" ? Colors.light : Colors.dark;

  const [searchInput, setSearchInput] = useState("");
  const [selectedType, setSelectedType] = useState("Hostel");

  const filteredCities = useMemo(() => {
    if (!searchInput) return [];
    return dummyCities.filter((city) =>
      city.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput]);

  return (
    <View
      style={{ padding: 20, backgroundColor: colors.card, borderRadius: 15 }}
    >
      {/* Search Input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 30,
          paddingHorizontal: 15,
          height: 50,
          backgroundColor: colors.background,
        }}
      >
        <Feather name="search" size={20} color={colors.primary} />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 16,
            color: colors.text,
          }}
          placeholder="Search by city"
          placeholderTextColor={colors.muted}
          value={searchInput}
          onChangeText={setSearchInput}
        />
        <TouchableOpacity
          onPress={() => onSearch(searchInput, selectedType)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: colors.primary,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Property Types */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 15 }}
      >
        {propertyTypes.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type)}
            style={{
              marginRight: 10,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 25,
              borderWidth: 1,
              borderColor:
                selectedType === type ? colors.primary : colors.border,
              backgroundColor:
                selectedType === type ? colors.primary : colors.card,
            }}
          >
            <Text
              style={{
                color: selectedType === type ? "#fff" : colors.text,
                fontWeight: "600",
              }}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Slider-like Preview */}
      <View style={{ marginTop: 20 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[...Array(5).keys()]}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                width: SCREEN_WIDTH * 0.6,
                height: 150,
                borderRadius: 15,
                marginRight: 15,
                backgroundColor: colors.border,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text }}>Property {item + 1}</Text>
            </View>
          )}
        />
      </View>

      {/* View All Marker */}
      <TouchableOpacity
        onPress={onViewAll}
        style={{
          marginTop: 20,
          alignSelf: "center",
          paddingHorizontal: 20,
          paddingVertical: 10,
          backgroundColor: colors.secondary,
          borderRadius: 25,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          View All Properties
        </Text>
      </TouchableOpacity>
    </View>
  );
}
