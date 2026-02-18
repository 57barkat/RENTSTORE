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
import { useApartments, useHomes, useRooms } from "@/hooks/useHomes";
import { formatAndTagFavorites } from "@/utils/homeTabUtils/homeHelpers";

export const useHomePageLogic = () => {
  const [search, setSearch] = useState("");
  const [selectedCity] = useState("");
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

  const { data: favData, refetch: refetchFavorites } =
    useGetUserFavoritesQuery(null);
  const { data: hData, isLoading: hLoad, refetch: refetchH } = useHomes();
  const { data: aData, isLoading: aLoad, refetch: refetchA } = useApartments();
  const { data: rData, isLoading: rLoad, refetch: refetchR } = useRooms();

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
  }, []);

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

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleStartAI = () => {
    toggleMenu();
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
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handleCancelVoice();
    await Promise.all([refetchH(), refetchA(), refetchR(), refetchFavorites()]);
    setRefreshing(false);
  }, [handleCancelVoice, refetchH, refetchA, refetchR, refetchFavorites]);

  const favoriteIds = useMemo(
    () => favData?.map((f: any) => f.property?._id) || [],
    [favData],
  );
  const homes = useMemo(
    () => formatAndTagFavorites(hData, selectedCity, favoriteIds),
    [hData, selectedCity, favoriteIds],
  );
  const rooms = useMemo(
    () => formatAndTagFavorites(rData, selectedCity, favoriteIds),
    [rData, selectedCity, favoriteIds],
  );
  const apartments = useMemo(
    () => formatAndTagFavorites(aData, selectedCity, favoriteIds),
    [aData, selectedCity, favoriteIds],
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
    toggleMenu,
    handleStartAI,
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
