import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Keyboard,
  Animated,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { debounce } from "@/utils/homeTabUtils/debounce";
import { filterCities } from "@/utils/homeTabUtils/filterCities";
// import { startPulseAnimation } from "@/utils/homeTabUtils/animations";
import { SearchBarProps } from "@/types/TabTypes/TabTypes";

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onFavPress,
}) => {
  const { theme } = useTheme();
  const currentColors = Colors[theme ?? "light"];

  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Debounced city filter
  const handleChange = useCallback(
    debounce((text: string) => {
      const filtered = filterCities(text);
      setFilteredCities(filtered);
      setShowDropdown(filtered.length > 0);
    }, 300),
    []
  );

  // useEffect(() => {
  //   if (showHint) {
  //     startPulseAnimation(pulseAnim).start();
  //     const timeout = setTimeout(() => setShowHint(false), 5000);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [showHint]);

  const onTextChange = (text: string) => {
    onChangeText(text);
    handleChange(text);
  };

  const handleSelect = (city: string) => {
    onChangeText(city);
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: currentColors.card }]}>
        <Feather
          name="search"
          size={20}
          color={currentColors.icon}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, { color: currentColors.text }]}
          placeholder={placeholder}
          placeholderTextColor={currentColors.muted}
          value={value}
          onChangeText={onTextChange}
        />

        {/* <View style={styles.favWrapper}>
          {showHint && (
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  backgroundColor: currentColors.primary + "33",
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.6],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
          {/* <TouchableOpacity onPress={onFavPress} style={styles.favButton}>
            <Ionicons name="heart" size={32} color={currentColors.danger} />
          </TouchableOpacity> */}
        {/* </View>  */}
      </View>

      {showDropdown && (
        <View
          style={[styles.dropdown, { backgroundColor: currentColors.card }]}
        >
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={[styles.itemText, { color: currentColors.text }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginVertical: 8 },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  favWrapper: { position: "relative" },
  pulseCircle: {
    position: "absolute",
    top: -6,
    left: -6,
    width: 44,
    height: 44,
    borderRadius: 22,
    zIndex: 0,
  },
  favButton: { zIndex: 1 },
  dropdown: {
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  itemText: { fontSize: 16 },
});

export default SearchBar;
