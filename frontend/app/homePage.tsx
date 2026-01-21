import React, { useState, useEffect } from "react";
import { FlatList, Alert, Platform, View, Text } from "react-native";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import SearchBar from "@/components/Filters/SearchBar";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

import HostOptionsRowProps from "@/components/Filters/HostOptions";
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
import Constants from "expo-constants";

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

  /* ======================================================
      VOICE STATE (EXPO-AV)
  ====================================================== */
  const { start, stop, play, stopPlayback, uri, isRecording, isPlaying } =
    useVoiceRecorder();

  const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "";

  /* ======================================================
      AUTO-UPLOAD LOGIC
  ====================================================== */
  // Smartly trigger upload only when recording stops and a URI exists
  useEffect(() => {
    if (!isRecording && uri) {
      uploadVoice(uri);
    }
  }, [isRecording, uri]);

  const mergeFavs = (props: any[]) =>
    props.map((p) => ({ ...p, isFav: favoriteIds?.includes(p.id) }));

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

  const handleToggleFav = async (propertyId: string, type: string) => {
    let updateState =
      type === "home" ? setHomes : type === "room" ? setRooms : setApartments;
    updateState((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, isFav: !p.isFav } : p)),
    );
    const list = type === "home" ? homes : type === "room" ? rooms : apartments;
    const property = list.find((p) => p.id === propertyId);
    try {
      property?.isFav
        ? await removeUserFavorite({ propertyId })
        : await addToFav({ propertyId });
    } catch {
      updateState((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, isFav: property?.isFav ?? false } : p,
        ),
      );
    }
  };

  /* ======================================================
      VOICE SEARCH API CALL
  ====================================================== */
  const uploadVoice = async (audioUri: string) => {
    try {
      const formData = new FormData();

      // Smartly format the URI for Multipart upload
      const cleanUri =
        Platform.OS === "android" ? audioUri : audioUri.replace("file://", "");

      formData.append("audio", {
        uri: cleanUri,
        name: "voice-search.m4a",
        type: "audio/m4a",
      } as any);

      const res = await fetch(`${API_URL}/search/voice`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await res.json();

      if (!data?.result?.data) {
        return Alert.alert("No results", data?.error || "Try again");
      }

      // Update search text and list results
      setSearch(data.transcription || "");
      const formatted = mergeFavs(formatProperties(data.result.data, ""));
      setHomes(formatted.filter((p) => p.type === "home"));
      setRooms(formatted.filter((p) => p.type === "room"));
      setApartments(formatted.filter((p) => p.type === "apartment"));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Voice search failed");
    }
  };

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
            onSelect={(id: string) =>
              router.push(`/property/View/${id}?type=${id}`)
            }
          />
          <SearchBar
            value={search}
            placeholder={isRecording ? "Listening..." : "Search properties..."}
            onChangeText={(text) => {
              setSearch(text);
              setSelectedCity(text);
            }}
            onFavPress={() => router.push("/favorites")}
            onVoiceStart={start}
            onVoiceStop={stop}
            onVoicePlay={play}
            onVoiceStopPlayback={stopPlayback}
            isRecording={isRecording}
            isPlaying={isPlaying}
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
              `/property/View/${item.hostOption}?type=${item.hostOption}`,
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
