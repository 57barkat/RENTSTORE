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
import * as Speech from "expo-speech"; // ← added for TTS
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
  const [transcription, setTranscription] = useState("");
  const [pendingFilters, setPendingFilters] = useState<any>(null);
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
  const { data: favData, refetch: refetchFavorites } =
    useGetUserFavoritesQuery(null);

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
    if (!isRecording && uri) setLocalAudioUri(uri);
  }, [isRecording, uri]);

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
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording]);

  // --- CONTINUOUS VOICE SEARCH HANDLER ---
  const handleSendVoice = async () => {
    if (!localAudioUri) return;

    setIsProcessing(true);

    try {
      const response = await voiceSearch({ uri: localAudioUri }).unwrap();

      const text = response.transcription || "";
      const filters = response.filters || null;
      const missingQuestion = response.missingQuestion || null;

      setTranscription(text);
      setPendingFilters(filters);
      setLocalAudioUri(null);

      // Speak transcription first
      if (text) Speech.speak(`You said: ${text}`);

      if (missingQuestion) {
        // Ask for missing filter via voice
        Speech.speak(missingQuestion, { rate: 0.9 });
        Alert.alert("Need More Info", missingQuestion, [
          { text: "Ok, I'm ready", onPress: () => start() },
        ]);
        return;
      }

      if (!filters || Object.keys(filters).length === 0) {
        // No filters detected
        Alert.alert(
          "Keep Talking",
          text
            ? `We heard: "${text}". Say more to refine your search.`
            : "We didn't catch that. Try saying something more specific.",
          [{ text: "Ok", onPress: () => start() }],
        );
        return;
      }

      // All required filters provided → Search now
      Speech.speak("Great! Searching properties now.", { rate: 1.0 });
      navigateWithFilters(filters, text);
    } catch (error) {
      console.error(error);
      Speech.speak("Error! Could not process voice. Try again.");
      Alert.alert("Error", "Could not process voice. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelVoice = () => {
    setLocalAudioUri(null);
    setTimerCount(0);
  };

  const navigateWithFilters = (filters: any, text: string) => {
    router.push({
      pathname: `/property/View/${filters.hostOption || "home"}`,
      params: {
        type: filters.hostOption || "home",
        city: filters.city || text || "",
        minRent: filters.minRent?.toString(),
        maxRent: filters.maxRent?.toString(),
        beds: filters.bedrooms?.toString(),
        bathrooms: filters.bathrooms?.toString(),
        addressQuery: filters.addressQuery || "",
        fromVoice: "true",
      },
    });

    // Reset for next session
    setTranscription("");
    setPendingFilters(null);
    setTimerCount(0);
  };

  // --- FAVORITES LOGIC ---
  const favoriteIds = useMemo(
    () => favData?.map((f: any) => f.property?._id).filter(Boolean) || [],
    [favData],
  );

  const attachFavStatus = (
    properties: PropertyCardProps[],
  ): PropertyCardProps[] =>
    properties.map((p) => ({ ...p, isFav: favoriteIds.includes(p.id) }));

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
      if (favoriteIds.includes(propertyId))
        await removeUserFavorite({ propertyId }).unwrap();
      else await addToFav({ propertyId }).unwrap();
      refetchFavorites();
    } catch {
      Alert.alert("Error", "Could not update favorites");
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
              onPress={() =>
                router.push({
                  pathname: `/property/View/home`,
                  params: { openFilters: "true", city: search },
                })
              }
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
