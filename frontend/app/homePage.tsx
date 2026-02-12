import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Speech from "expo-speech";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import SearchBar from "@/components/Filters/SearchBar";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import HostOptionsRowProps from "@/components/Filters/HostOptions";
import AdsSliderProps from "@/components/Filters/AdsSlider";
import { PropertySection } from "@/components/Filters/PropertySection";
import { useApartments, useHomes, useRooms } from "@/hooks/useHomes";
import {
  useAddToFavMutation,
  useClearVoiceSessionMutation,
  useGetUserFavoritesQuery,
  useRemoveUserFavoriteMutation,
  useVoiceSearchMutation,
} from "@/services/api";
import { formatProperties } from "@/utils/homeTabUtils/formatProperties";
import VoiceAssistant from "@/components/Assistant/VoiceAssistant";
import { Ionicons } from "@expo/vector-icons";

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const [isAutoStop, setIsAutoStop] = useState(true);
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoSending = useRef(false);

  const [clearVoiceSession] = useClearVoiceSessionMutation();
  const [voiceSearch] = useVoiceSearchMutation();
  const [addToFav] = useAddToFavMutation();
  const [removeUserFavorite] = useRemoveUserFavoriteMutation();

  const { start, stop, isRecording } = useVoiceRecorder();

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleCancelVoice();
    };
  }, []);

  // Timer for auto-stop while recording
  useEffect(() => {
    if (!isRecording) {
      clearTimers();
      return;
    }

    setTimerCount(0);
    isAutoSending.current = false;

    intervalRef.current = setInterval(() => {
      setTimerCount((prev) => {
        const nextVal = prev + 1;
        if (isAutoStop && nextVal >= 5) {
          if (silenceTimeoutRef.current)
            clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = setTimeout(handleStopAndSend, 1000);
        }
        return nextVal;
      });
    }, 1000);

    return clearTimers;
  }, [isRecording, isAutoStop]);

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
  };

  const handleStopAndSend = async () => {
    if (isAutoSending.current) return;
    isAutoSending.current = true;
    const recordedUri = await stop();
    if (recordedUri) handleSendVoice(recordedUri);
  };

  const handleSendVoice = async (audioUri: string) => {
    setIsProcessing(true);
    setAssistantMessage("Processing...");
    try {
      const response = await voiceSearch({ uri: audioUri }).unwrap();
      console.log("Voice API response:", response);
      const aiMessage = response.message || "Match found!";
      setAssistantMessage(aiMessage);
      setIsSpeaking(true);
      Speech.speak(aiMessage, {
        onDone: () => {
          setIsSpeaking(false);
          if (response.result?.data.length > 0) {
            navigateWithFilters(response.filters);
          } else if (
            !["done", "stop"].some((w) =>
              response.transcription.toLowerCase().includes(w),
            )
          ) {
            start();
          }
        },
      });
    } catch {
      setAssistantMessage("I couldn't hear that clearly.");
    } finally {
      setIsProcessing(false);
      isAutoSending.current = false;
    }
  };

  const navigateWithFilters = (filters: any) => {
    router.push({
      pathname: `/property/View/${filters?.hostOption || "home"}`,
      params: { ...filters, fromVoice: "true" },
    });
    setAssistantMessage(null);
  };

  const handleCancelVoice = useCallback(async () => {
    try {
      await clearVoiceSession().unwrap();
    } catch {}
    setAssistantMessage(null);
    if (isRecording) stop();
    Speech.stop();
    setIsProcessing(false);
    setIsSpeaking(false);
    clearTimers();
  }, [isRecording]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handleCancelVoice(); // Clear voice session
    await Promise.all([
      refetchHomes(),
      refetchApartments(),
      refetchRooms(),
      refetchFavorites(),
    ]);
    setRefreshing(false);
  }, []);

  // Favorites helper
  const favoriteIds = useMemo(
    () => favData?.map((f: any) => f.property?._id) || [],
    [favData],
  );

  const homes = useMemo(
    () =>
      formatProperties(homesData || [], selectedCity).map((p) => ({
        ...p,
        isFav: favoriteIds.includes(p.id),
      })),
    [homesData, favoriteIds],
  );
  const rooms = useMemo(
    () =>
      formatProperties(roomsData || [], selectedCity).map((p) => ({
        ...p,
        isFav: favoriteIds.includes(p.id),
      })),
    [roomsData, favoriteIds],
  );
  const apartments = useMemo(
    () =>
      formatProperties(apartmentsData || [], selectedCity).map((p) => ({
        ...p,
        isFav: favoriteIds.includes(p.id),
      })),
    [apartmentsData, favoriteIds],
  );

  const sections = [
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

  const showAssistant =
    isProcessing || !!assistantMessage || isRecording || isSpeaking;

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <HostOptionsRowProps
              onSelect={(id) => router.push(`/property/View/${id}`)}
            />
            <SearchBar
              value={search}
              onPress={() =>
                router.push({
                  pathname: `/property/View/home`,
                  params: { openFilters: "true" },
                })
              }
            />
            <AdsSliderProps />
          </>
        }
        renderItem={({ item }) => (
          <PropertySection
            sectionTitle={item.title}
            properties={item.properties}
            loading={item.queryLoading}
            onViewAll={() => router.push(`/property/View/${item.hostOption}`)}
            onCardPress={(id) => router.push(`/property/${id}`)}
            onToggleFav={async (id) => {
              favoriteIds.includes(id)
                ? await removeUserFavorite({ propertyId: id })
                : await addToFav({ propertyId: id });
              refetchFavorites();
            }}
          />
        )}
      />

      {!showAssistant && (
        <TouchableOpacity
          style={[styles.aiButton, { backgroundColor: currentTheme.secondary }]}
          onPress={() => {
            setAssistantMessage("How can I help?");
            start();
          }}
        >
          <Ionicons name="sparkles" size={24} color="#fff" />
          <Text style={{ color: "#fff", marginLeft: 8 }}>AI Matcher</Text>
        </TouchableOpacity>
      )}

      {showAssistant && (
        <VoiceAssistant
          currentTheme={currentTheme}
          isProcessing={isProcessing}
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          timerCount={timerCount}
          assistantMessage={assistantMessage}
          isAutoStop={isAutoStop}
          onModeChange={setIsAutoStop}
          onCancel={handleCancelVoice}
          onAction={() => (isRecording ? handleStopAndSend() : start())}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  aiButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 8,
  },
});

export default HomePage;
