import React, { useState } from "react";
import { FlatList, View, Text } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

import HostOptionsRowProps from "@/components/Filters/HostOptions";
import SearchBar from "@/components/Filters/SearchBar";
import AdsSliderProps from "@/components/Filters/AdsSlider";
import { PropertySection } from "@/components/Filters/PropertySection";
import { useApartments, useHomes, useRooms } from "@/hooks/useHomes";
import { SectionData } from "@/types/TabTypes/TabTypes";
import {
  useAddToFavMutation,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import { formatProperties } from "@/utils/homeTabUtils/formatProperties";

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingFavId, setLoadingFavId] = useState<string | null>(null);

  const [addToFav] = useAddToFavMutation();
  const [removeUserFavorite] = useRemoveUserFavoriteMutation();

  const { data: homesData, isLoading: homesLoading } = useHomes();
  const { data: apartmentsData, isLoading: apartmentsLoading } =
    useApartments();
  const { data: roomsData, isLoading: roomsLoading } = useRooms();

  const handleToggleFav = async (id: string, isFav?: boolean) => {
    try {
      setLoadingFavId(id);
      if (isFav) {
        await removeUserFavorite({ propertyId: id });
      } else {
        await addToFav({ propertyId: id });
      }
    } catch (err) {
      console.log("Fav error:", err);
    } finally {
      setLoadingFavId(null);
    }
  };

  const sections: SectionData[] = [
    {
      title: "Homes",
      properties: formatProperties(
        homesData,
        selectedCity,
        loadingFavId,
        handleToggleFav,
        selectedCity
      ),
      queryLoading: homesLoading,
      hostOption: "home",
    },
    {
      title: "Hostels",
      properties: formatProperties(
        roomsData,
        selectedCity,
        loadingFavId,
        handleToggleFav,
        selectedCity
      ),
      queryLoading: roomsLoading,
      hostOption: "hostel",
    },
    {
      title: "Apartments",
      properties: formatProperties(
        apartmentsData,
        selectedCity,
        loadingFavId,
        handleToggleFav,
        selectedCity
      ),
      queryLoading: apartmentsLoading,
      hostOption: "apartment",
    },
  ];

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.title}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 20,
        backgroundColor: currentTheme.background,
      }}
      ListHeaderComponent={
        <>
          <HostOptionsRowProps
            onSelect={(id: any) => console.log("Selected:", id)}
          />
          <SearchBar
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setSelectedCity(text);
            }}
            placeholder="Search properties..."
            onFavPress={() => router.push("/favorites")}
          />
          <AdsSliderProps />
        </>
      }
      renderItem={({ item }) => (
        <PropertySection
          sectionTitle={item.title}
          properties={item.properties}
          loading={item.queryLoading}
          onViewAll={() =>
            router.push(
              `/property/View/${item.hostOption}?type=${item.hostOption}`
            )
          }
          onCardPress={(id) => router.push(`/property/${id}`)}
        />
      )}
      ListEmptyComponent={
        <View style={{ padding: 20 }}>
          <Text style={{ color: currentTheme.text }}>No properties found.</Text>
        </View>
      }
    />
  );
};

export default HomePage;
