import React, { useState, useMemo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  Dimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useDebounce } from "use-debounce";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface SearchBarWithDropdownProps {
  cities: string[];
  selectedCity: string;
  searchInput: string;
  setSearchInput: (text: string) => void;
  onCitySelect: (city: string) => void;
  onClearCity: () => void;
}

const SearchBarWithDropdown: React.FC<SearchBarWithDropdownProps> = ({
  cities,
  selectedCity,
  searchInput,
  setSearchInput,
  onCitySelect,
  onClearCity,
}) => {
  const { theme } = useTheme();
  const colors = theme === "light" ? Colors.light : Colors.dark;

  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedSearch] = useDebounce(searchInput, 400);

  const filteredCities = useMemo(() => {
    if (!debouncedSearch) return [];
    return cities.filter((city) =>
      city.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch, cities]);

  return (
    <View style={{ marginBottom: 15, zIndex: 10 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 30,
          paddingHorizontal: 15,
          height: 55,
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <Feather name="search" size={20} color={colors.primary} />
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            marginLeft: 10,
            fontWeight: "500",
            maxWidth: selectedCity ? "50%" : "80%",
            color: colors.text,
          }}
          placeholder="Search by city"
          placeholderTextColor={colors.muted}
          value={searchInput}
          onChangeText={(text) => {
            setSearchInput(text);
            setShowDropdown(!!text);
          }}
          onFocus={() => searchInput && setShowDropdown(true)}
          autoCorrect={false}
          autoCapitalize="words"
        />

        {selectedCity && (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginLeft: 10,
              backgroundColor: colors.primary,
            }}
            onPress={onClearCity}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
              {selectedCity}
            </Text>
            <Ionicons
              name="close-circle"
              size={16}
              color="#fff"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && filteredCities.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            borderRadius: 10,
            borderWidth: 1,
            backgroundColor: colors.card,
            borderColor: colors.border,
            maxHeight: SCREEN_HEIGHT * 0.3,
            zIndex: 1000,
          }}
        >
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled" // important
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  padding: 15,
                  flexDirection: "row",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
                onPress={() => {
                  onCitySelect(item);
                  setShowDropdown(false);
                  setSearchInput("");
                }}
              >
                <Feather
                  name="map-pin"
                  size={16}
                  color={colors.muted}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};
export default SearchBarWithDropdown;
