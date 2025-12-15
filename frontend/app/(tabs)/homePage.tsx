import React, { useState, useEffect } from "react";
import { FlatList, View, Text } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

import HostOptionsRowProps from "@/components/Filters/HostOptions";
import SearchBar from "@/components/Filters/SearchBar";
import AdsSliderProps from "@/components/Filters/AdsSlider";
import { PropertySection } from "@/components/Filters/PropertySection";

import { useApartments, useHomes, useRooms } from "@/hooks/useHomes";
import { PropertyCardProps, SectionData } from "@/types/TabTypes/TabTypes";

import {
  useAddToFavMutation,
  useGetUserFavoritesQuery,
  useRemoveUserFavoriteMutation,
} from "@/services/api";

import { formatProperties } from "@/utils/homeTabUtils/formatProperties";

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [homes, setHomes] = useState<PropertyCardProps[]>([]);
  const [rooms, setRooms] = useState<PropertyCardProps[]>([]);
  const [apartments, setApartments] = useState<PropertyCardProps[]>([]);

  const { data: homesData, isLoading: homesLoading } = useHomes();
  const { data: apartmentsData, isLoading: apartmentsLoading } =
    useApartments();
  const { data: roomsData, isLoading: roomsLoading } = useRooms();

  const { data: favData } = useGetUserFavoritesQuery(null);
  const favoriteIds = favData?.map((f: any) => f.property?._id).filter(Boolean);

  const [addToFav] = useAddToFavMutation();
  const [removeUserFavorite] = useRemoveUserFavoriteMutation();

  const mergeFavs = (props: any[]) => {
    return props.map((p) => ({
      ...p,
      isFav: favoriteIds.includes(p.id),
    }));
  };

  // Sync properties when data or favorites change
  useEffect(() => {
    if (homesData)
      setHomes(mergeFavs(formatProperties(homesData, selectedCity)));
  }, [homesData, selectedCity, favData]);

  useEffect(() => {
    if (roomsData)
      setRooms(mergeFavs(formatProperties(roomsData, selectedCity)));
  }, [roomsData, selectedCity, favData]);

  useEffect(() => {
    if (apartmentsData)
      setApartments(mergeFavs(formatProperties(apartmentsData, selectedCity)));
  }, [apartmentsData, selectedCity, favData]);

  // Toggle Favorite
  const handleToggleFav = async (propertyId: string, type: string) => {
    let updateState: React.Dispatch<React.SetStateAction<PropertyCardProps[]>>;

    if (type === "home") updateState = setHomes;
    else if (type === "room") updateState = setRooms;
    else updateState = setApartments;

    // Optimistic update
    updateState((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, isFav: !p.isFav } : p))
    );

    // API call
    const propertyList =
      type === "home" ? homes : type === "room" ? rooms : apartments;
    const property = propertyList.find((p) => p.id === propertyId);

    try {
      if (property?.isFav) {
        await removeUserFavorite({ propertyId });
      } else {
        await addToFav({ propertyId });
      }
    } catch (err) {
      console.log("Fav error:", err);
      // rollback
      updateState((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, isFav: property?.isFav ?? false } : p
        )
      );
    }
  };

  // Section Data
  const sections: SectionData[] = [
    {
      title: "Homes",
      properties: homes,
      queryLoading: homesLoading,
      hostOption: "home",
    },
    {
      title: "Hostels",
      properties: rooms,
      queryLoading: roomsLoading,
      hostOption: "room",
    },
    {
      title: "Apartments",
      properties: apartments,
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
            onSelect={(id: string) => console.log("Selected:", id)}
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
          onToggleFav={(id) => handleToggleFav(id, item.hostOption)}
          cardWidth={250}
          cardHeight={200}
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
