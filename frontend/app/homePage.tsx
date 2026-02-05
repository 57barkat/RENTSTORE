import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  FlatList,
  Alert,
  View,
  Text,
  Modal,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
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
  useVoiceSearchMutation,
} from "@/services/api";

import { formatProperties } from "@/utils/homeTabUtils/formatProperties";

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  // Search & Audio States
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const [localAudioUri, setLocalAudioUri] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // API Queries
  const {
    data: homesData,
    isLoading: homesLoading,
    refetch: refetchHomes,
  } = useHomes();

  const {
    data: apartmentsData,
    isLoading: apartmentsLoading,
    refetch: refetchApartments,
  } = useApartments();

  const {
    data: roomsData,
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useRooms();

  const {
    data: favData,
    isLoading: favLoading,
    refetch: refetchFavorites,
  } = useGetUserFavoritesQuery(null);

  // Mutations
  const [addToFav] = useAddToFavMutation();
  const [removeUserFavorite] = useRemoveUserFavoriteMutation();
  const [voiceSearch] = useVoiceSearchMutation();

  const { start, stop, uri, isRecording } = useVoiceRecorder();

  // Refresh Logic
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchHomes(),
        refetchApartments(),
        refetchRooms(),
        refetchFavorites(),
      ]);
    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchHomes, refetchApartments, refetchRooms, refetchFavorites]);

  // Voice Recording URI sync
  useEffect(() => {
    if (!isRecording && uri) {
      setLocalAudioUri(uri);
    }
  }, [isRecording, uri]);

  // Voice Recording Timer
  useEffect(() => {
    if (isRecording) {
      setTimerCount(0);
      intervalRef.current = setInterval(() => {
        setTimerCount((prev) => {
          if (prev >= 14) {
            stop();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  // Voice Search Handler
  const handleSendVoice = async () => {
    if (!localAudioUri) return;

    setIsProcessing(true);
    try {
      const response = await voiceSearch({
        uri: localAudioUri,
      }).unwrap();

      if (!response?.filters || Object.keys(response.filters).length === 0) {
        Alert.alert(
          "I didn't quite catch that",
          "Try saying something like 'Find 3 bedroom houses in Islamabad'.",
          [{ text: "Try Again", onPress: () => setLocalAudioUri(null) }],
        );
        return;
      }

      const extracted = response.filters;

      router.push({
        pathname: `/property/View/${extracted.type || "home"}`,
        params: {
          type: extracted.type || "home",
          city: extracted.city || response.transcription || "",
          minRent: extracted.minRent?.toString(),
          maxRent: extracted.maxRent?.toString(),
          beds: extracted.bedrooms?.toString(),
          bathrooms: extracted.bathrooms?.toString(),
          addressQuery: extracted.addressQuery || "",
          fromVoice: "true",
        },
      });

      setLocalAudioUri(null);
    } catch {
      Alert.alert(
        "Connection Error",
        "Please check your internet and try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelVoice = () => {
    setLocalAudioUri(null);
    setTimerCount(0);
  };

  // Favorites
  const favoriteIds = useMemo(
    () => favData?.map((f: any) => f.property?._id).filter(Boolean) || [],
    [favData],
  );

  const attachFavStatus = (
    properties: PropertyCardProps[],
  ): PropertyCardProps[] =>
    properties.map((p) => ({
      ...p,
      isFav: favoriteIds.includes(p.id),
    }));

  // Derived Data (NO STATE = NO LOOP)
  const homes = useMemo(
    () => attachFavStatus(formatProperties(homesData || [], selectedCity)),
    [homesData, selectedCity, favoriteIds],
  );

  const rooms = useMemo(
    () => attachFavStatus(formatProperties(roomsData || [], selectedCity)),
    [roomsData, selectedCity, favoriteIds],
  );

  const apartments = useMemo(
    () => attachFavStatus(formatProperties(apartmentsData || [], selectedCity)),
    [apartmentsData, selectedCity, favoriteIds],
  );

  const handleToggleFav = async (propertyId: string) => {
    try {
      const isFav = favoriteIds.includes(propertyId);

      if (isFav) {
        await removeUserFavorite({ propertyId }).unwrap();
      } else {
        await addToFav({ propertyId }).unwrap();
      }

      refetchFavorites();
    } catch {
      Alert.alert("Error", "Could not update favorites");
    }
  };

  // Sections
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
      hostOption: "hostel",
    },
    {
      title: "Apartments",
      properties: apartments,
      queryLoading: apartmentsLoading,
      hostOption: "apartment",
    },
  ];

  // Initial Loading
  if ((homesLoading || apartmentsLoading || roomsLoading) && !refreshing) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ marginTop: 10, color: currentTheme.text }}>
          Loading Properties...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      {/* Voice Processing Modal */}
      <Modal transparent visible={isProcessing} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.card },
            ]}
          >
            <ActivityIndicator size="large" color={currentTheme.secondary} />
            <Text style={[styles.modalText, { color: currentTheme.text }]}>
              Finding your perfect match...
            </Text>
          </View>
        </View>
      </Modal>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.primary]}
            tintColor={currentTheme.primary}
          />
        }
        ListHeaderComponent={
          <>
            <HostOptionsRowProps
              onSelect={(id: string) =>
                router.push(`/property/View/${id}?type=${id}`)
              }
            />
            <SearchBar
              value={search}
              placeholder="Where do you want to live?"
              onChangeText={(text) => {
                setSearch(text);
                setSelectedCity(text);
              }}
              onPress={() => {
                router.push({
                  pathname: `/property/View/home`,
                  params: { openFilters: "true", city: search },
                });
              }}
              onFavPress={() => router.push("/favorites")}
              onVoiceStart={start}
              onVoiceStop={stop}
              onSendVoice={handleSendVoice}
              onCancelVoice={handleCancelVoice}
              isRecording={isRecording}
              hasAudio={!!localAudioUri}
              timer={timerCount}
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
            onCardPress={(id: any) => router.push(`/property/${id}`)}
            onToggleFav={(id: any) => handleToggleFav(id)}
            cardWidth={250}
            cardHeight={200}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    width: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default HomePage;
