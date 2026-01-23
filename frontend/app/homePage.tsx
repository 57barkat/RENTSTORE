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

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const [localAudioUri, setLocalAudioUri] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: homesData, isLoading: homesLoading } = useHomes();
  const { data: apartmentsData, isLoading: apartmentsLoading } =
    useApartments();
  const { data: roomsData, isLoading: roomsLoading } = useRooms();
  const { data: favData } = useGetUserFavoritesQuery(null);

  const [addToFav] = useAddToFavMutation();
  const [removeUserFavorite] = useRemoveUserFavoriteMutation();
  const [voiceSearch] = useVoiceSearchMutation();

  const { start, stop, uri, isRecording } = useVoiceRecorder();

  // Sync Hook URI to Local State when recording finishes
  useEffect(() => {
    if (!isRecording && uri) {
      setLocalAudioUri(uri);
    }
  }, [isRecording, uri]);

  // 15-Second Limit Logic
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
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  const handleSendVoice = async () => {
    if (!localAudioUri) return;
    setIsProcessing(true);
    try {
      const response = await voiceSearch({ uri: localAudioUri }).unwrap();

      if (!response?.filters || Object.keys(response.filters).length === 0) {
        setIsProcessing(false);
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
          fromVoice: "true",
        },
      });

      setLocalAudioUri(null);
    } catch (error) {
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

  const favoriteIds = useMemo(() => {
    return favData?.map((f: any) => f.property?._id).filter(Boolean) || [];
  }, [favData]);

  const attachFavStatus = useCallback(
    (properties: PropertyCardProps[]) => {
      return properties.map((p) => ({
        ...p,
        isFav: favoriteIds.includes(p.id),
      }));
    },
    [favoriteIds],
  );

  const homes = useMemo(
    () => attachFavStatus(formatProperties(homesData || [], selectedCity)),
    [homesData, selectedCity, favoriteIds, attachFavStatus],
  );
  const rooms = useMemo(
    () => attachFavStatus(formatProperties(roomsData || [], selectedCity)),
    [roomsData, selectedCity, favoriteIds, attachFavStatus],
  );
  const apartments = useMemo(
    () => attachFavStatus(formatProperties(apartmentsData || [], selectedCity)),
    [apartmentsData, selectedCity, favoriteIds, attachFavStatus],
  );

  const handleToggleFav = async (propertyId: string) => {
    const isCurrentlyFav = favoriteIds.includes(propertyId);
    try {
      if (isCurrentlyFav) {
        await removeUserFavorite({ propertyId }).unwrap();
      } else {
        await addToFav({ propertyId }).unwrap();
      }
    } catch (error) {
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
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
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
            onCardPress={(id) => router.push(`/property/${id}`)}
            onToggleFav={(id) => handleToggleFav(id)}
            cardWidth={250}
            cardHeight={200}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
