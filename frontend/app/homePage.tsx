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

  // General states
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Voice assistant states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const [isAutoStop, setIsAutoStop] = useState(true);
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<any>(null);

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoSending = useRef(false);

  const { start, stop } = useVoiceRecorder();

  // API hooks
  const [voiceSearch] = useVoiceSearchMutation();
  const [clearVoiceSession] = useClearVoiceSessionMutation();
  const [addToFav] = useAddToFavMutation();
  const [removeUserFavorite] = useRemoveUserFavoriteMutation();
  const { data: favData, refetch: refetchFavorites } =
    useGetUserFavoritesQuery(null);

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
    setIsRecording(false);
    if (recordedUri) handleSendVoice(recordedUri);
  };

  const handleStartAI = () => {
    const greeting =
      "Hello! Tell me the city, area, and your budget. I will find properties for you.";
    setAssistantMessage(greeting);
    setIsSpeaking(true);
    setLastFilters(null);

    Speech.speak(greeting, {
      onDone: () => {
        setIsSpeaking(false);
        start();
        setIsRecording(true);
      },
    });
  };

  const handleSkipSpeech = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);

    if (lastFilters) {
      navigateWithFilters(lastFilters);
      setLastFilters(null);
    } else {
      start();
      setIsRecording(true);
    }
  }, [lastFilters, start]);

  const handleSendVoice = async (audioUri: string) => {
    setIsProcessing(true);
    setAssistantMessage("Processing...");

    try {
      const response = await voiceSearch({ uri: audioUri }).unwrap();
      const { filters, result, message } = response;

      setAssistantMessage(message);
      setIsSpeaking(true);

      if (result?.data?.length > 0) {
        setLastFilters(filters);
      } else {
        setLastFilters(null);
      }

      Speech.speak(message, {
        onDone: () => {
          setIsSpeaking(false);
          if (result?.data?.length > 0) {
            navigateWithFilters(filters);
          } else {
            start();
            setIsRecording(true);
          }
        },
      });
    } catch {
      const errorMsg = "I couldn't understand your request. Please try again.";
      setAssistantMessage(errorMsg);
      setIsSpeaking(true);
      setLastFilters(null);
      Speech.speak(errorMsg);
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
    setLastFilters(null);
    setIsSpeaking(false);
    Speech.stop();
  };

  const handleCancelVoice = useCallback(async () => {
    try {
      await clearVoiceSession().unwrap();
    } catch {}
    setAssistantMessage(null);
    setLastFilters(null);
    if (isRecording) stop();
    Speech.stop();
    setIsProcessing(false);
    setIsSpeaking(false);
    clearTimers();
  }, [isRecording]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handleCancelVoice();
    await Promise.all([
      refetchHomes(),
      refetchApartments(),
      refetchRooms(),
      refetchFavorites(),
    ]);
    setRefreshing(false);
  }, []);

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
        <View style={styles.floatingActions}>
          <TouchableOpacity
            style={[
              styles.nearbyButton,
              { backgroundColor: currentTheme.tint },
            ]}
            onPress={() => router.push("/NearbyScreen")}
          >
            <Ionicons name="location" size={22} color="#fff" />
            <Text style={styles.buttonText}>Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.aiButton,
              { backgroundColor: currentTheme.secondary },
            ]}
            onPress={handleStartAI}
          >
            <Ionicons name="sparkles" size={22} color="#fff" />
            <Text style={styles.buttonText}>AI Matcher</Text>
          </TouchableOpacity>
        </View>
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
          skipSpeech={handleSkipSpeech}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingActions: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "flex-end",
    gap: 12,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  nearbyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonText: { color: "#fff", marginLeft: 8, fontWeight: "700", fontSize: 10 },
});

export default HomePage;
