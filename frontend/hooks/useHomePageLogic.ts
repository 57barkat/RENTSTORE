import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Animated } from "react-native";
import * as Speech from "expo-speech";
import { router } from "expo-router";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import {
  useAddToFavMutation,
  useClearVoiceSessionMutation,
  useGetUserFavoritesQuery,
  useRemoveUserFavoriteMutation,
  useVoiceSearchMutation,
} from "@/services/api";
import { useAuth } from "@/contextStore/AuthContext";
import { useApartments, useHomes, useRooms } from "@/hooks/useHomes";
import { formatAndTagFavorites } from "@/utils/homeTabUtils/homeHelpers";

export const useHomePageLogic = () => {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCity] = useState(""); // This is currently empty
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const [isAutoStop, setIsAutoStop] = useState(true);
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoSending = useRef(false);

  const { start, stop } = useVoiceRecorder();
  const [voiceSearch] = useVoiceSearchMutation();
  const [clearVoiceSession] = useClearVoiceSessionMutation();
  const [addToFav] = useAddToFavMutation();
  const [removeUserFavorite] = useRemoveUserFavoriteMutation();

  const { data: favData, refetch: refetchFavorites } = useGetUserFavoritesQuery(
    null,
    { skip: isGuest },
  );
  const { data: hData, isLoading: hLoad, refetch: refetchH } = useHomes();
  const { data: aData, isLoading: aLoad, refetch: refetchA } = useApartments();
  const { data: rData, isLoading: rLoad, refetch: refetchR } = useRooms();

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
  }, []);

  const handleCancelVoice = useCallback(async () => {
    clearVoiceSession()
      .unwrap()
      .catch(() => {});
    setAssistantMessage(null);
    setLastFilters(null);
    if (isRecording) stop();
    Speech.stop();
    setIsProcessing(false);
    setIsSpeaking(false);
    clearTimers();
  }, [isRecording, stop, clearVoiceSession, clearTimers]);

  const handleStopAndSend = useCallback(async () => {
    if (isAutoSending.current) return;
    isAutoSending.current = true;
    const recordedUri = await stop();
    setIsRecording(false);
    if (recordedUri) {
      setIsProcessing(true);
      setAssistantMessage("Processing...");
      try {
        const response = await voiceSearch({ uri: recordedUri }).unwrap();
        setAssistantMessage(response.message);
        setIsSpeaking(true);
        setLastFilters(
          response.result?.data?.length > 0 ? response.filters : null,
        );
        Speech.speak(response.message, {
          onDone: () => {
            setIsSpeaking(false);
            if (response.result?.data?.length > 0) {
              router.push({
                pathname: `/property/View/${response.filters?.hostOption || "home"}`,
                params: { ...response.filters, fromVoice: "true" },
              });
              setAssistantMessage(null);
            } else {
              start();
              setIsRecording(true);
            }
          },
        });
      } catch {
        setAssistantMessage("I couldn't understand. Please try again.");
        setIsSpeaking(true);
        Speech.speak("I couldn't understand. Please try again.");
      } finally {
        setIsProcessing(false);
        isAutoSending.current = false;
      }
    }
  }, [stop, voiceSearch, start]);

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
  }, [isRecording, isAutoStop, handleStopAndSend, clearTimers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    handleCancelVoice();
    await Promise.all([
      refetchH().catch(() => {}),
      refetchA().catch(() => {}),
      refetchR().catch(() => {}),
      (isGuest ? Promise.resolve() : refetchFavorites()).catch(() => {}),
    ]);
    setRefreshing(false);
  }, [handleCancelVoice, isGuest, refetchH, refetchA, refetchR, refetchFavorites]);

  const favoriteIds = useMemo(
    () => (isGuest ? [] : favData?.map((f: any) => f.property?._id) || []),
    [favData, isGuest],
  );

  // Helper to ensure city extraction consistency on Home Page
  const processProperties = (rawData: any[]) => {
    if (!rawData) return [];

    // First, use your existing format utility
    const formatted = formatAndTagFavorites(rawData, selectedCity, favoriteIds);

    // Second, perform the safety check for the 'city' field
    return formatted.map((item: any, index: number) => {
      const raw = rawData[index];
      let city = item.city;

      if (!city) {
        // Try address object
        if (
          raw?.address &&
          typeof raw.address === "object" &&
          !Array.isArray(raw.address)
        ) {
          city = raw.address.city;
        }
        // Fallback to parsing location string
        else if (raw?.location) {
          const parts = raw.location.split(",");
          const last = parts[parts.length - 1]?.trim();
          city =
            last?.toLowerCase() === "pakistan" && parts.length > 1
              ? parts[parts.length - 2]?.trim()
              : last;
        }
      }

      return { ...item, city: city || "Islamabad" };
    });
  };

  const homes = useMemo(() => processProperties(hData), [hData, favoriteIds]);
  const rooms = useMemo(() => processProperties(rData), [rData, favoriteIds]);
  const apartments = useMemo(
    () => processProperties(aData),
    [aData, favoriteIds],
  );

  return {
    search,
    setSearch,
    refreshing,
    isMenuOpen,
    menuAnimation,
    isProcessing,
    isRecording,
    isSpeaking,
    timerCount,
    isAutoStop,
    setIsAutoStop,
    assistantMessage,
    toggleMenu: () => {
      const toValue = isMenuOpen ? 0 : 1;
      Animated.spring(menuAnimation, {
        toValue,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      setIsMenuOpen(!isMenuOpen);
    },
    handleStartAI: () => {
      const msg = "Hello! Tell me the city, area, and budget.";
      setAssistantMessage(msg);
      setIsSpeaking(true);
      Speech.speak(msg, {
        onDone: () => {
          setIsSpeaking(false);
          start();
          setIsRecording(true);
        },
      });
    },
    handleCancelVoice,
    handleStopAndSend,
    onRefresh,
    homes,
    homesLoading: hLoad,
    rooms,
    roomsLoading: rLoad,
    apartments,
    apartmentsLoading: aLoad,
    favoriteIds,
    removeUserFavorite,
    addToFav,
    refetchFavorites,
    start,
    handleSkipSpeech: () => {
      Speech.stop();
      setIsSpeaking(false);
      start();
      setIsRecording(true);
    },
  };
};
