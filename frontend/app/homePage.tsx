import React from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import SearchBar from "@/components/Filters/SearchBar";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import HostOptionsRowProps from "@/components/Filters/HostOptions";
import AdsSliderProps from "@/components/Filters/AdsSlider";
import { PropertySection } from "@/components/Filters/PropertySection";
import VoiceAssistant from "@/components/Assistant/VoiceAssistant";
import { Ionicons } from "@expo/vector-icons";
import { useHomePageLogic } from "@/hooks/useHomePageLogic";
import { getSectionsData } from "@/utils/homeTabUtils/homeHelpers";
import PhoneVerificationBanner from "@/components/VerificationBanner";

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const logic = useHomePageLogic();

  const sections = getSectionsData(
    logic.homes,
    logic.homesLoading,
    logic.rooms,
    logic.roomsLoading,
    logic.apartments,
    logic.apartmentsLoading,
  );

  const showAssistant =
    logic.isProcessing ||
    !!logic.assistantMessage ||
    logic.isRecording ||
    logic.isSpeaking;

  const backdropStyle = { opacity: logic.menuAnimation };
  const actionStyle = {
    opacity: logic.menuAnimation,
    transform: [
      { scale: logic.menuAnimation },
      {
        translateY: logic.menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0],
        }),
      },
    ],
  };
  const rotateStyle = {
    transform: [
      {
        rotate: logic.menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={logic.refreshing}
            onRefresh={logic.onRefresh}
          />
        }
        ListHeaderComponent={
          <>
            <View style={{ flex: 1 }}>
              <PhoneVerificationBanner />
            </View>

            <HostOptionsRowProps
              onSelect={(id) => router.push(`/property/View/${id}`)}
            />
            <SearchBar
              value={logic.search}
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
              logic.favoriteIds.includes(id)
                ? await logic.removeUserFavorite({ propertyId: id })
                : await logic.addToFav({ propertyId: id });
              logic.refetchFavorites();
            }}
          />
        )}
      />

      {logic.isMenuOpen && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        >
          <Pressable style={{ flex: 1 }} onPress={logic.toggleMenu} />
        </Animated.View>
      )}

      {!showAssistant && (
        <View style={styles.floatingActions}>
          <Animated.View style={[actionStyle, { gap: 12 }]}>
            <TouchableOpacity
              style={[
                styles.nearbyButton,
                { backgroundColor: currentTheme.secondary },
              ]}
              onPress={() => {
                logic.toggleMenu();
                router.push("/NearbyScreen");
              }}
            >
              <Ionicons name="location" size={12} color="#fff" />
              <Text style={styles.buttonText}>Nearby</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.aiButton,
                { backgroundColor: currentTheme.secondary },
              ]}
              onPress={logic.handleStartAI}
            >
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text style={styles.buttonText}>AI Matcher</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity
            style={[
              styles.menuToggleButton,
              { backgroundColor: currentTheme.secondary },
            ]}
            onPress={logic.toggleMenu}
            activeOpacity={0.8}
          >
            <Animated.View style={[rotateStyle]}>
              <Ionicons name="add" size={28} color={currentTheme.background} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}

      {showAssistant && (
        <VoiceAssistant
          currentTheme={currentTheme}
          isProcessing={logic.isProcessing}
          isRecording={logic.isRecording}
          isSpeaking={logic.isSpeaking}
          timerCount={logic.timerCount}
          assistantMessage={logic.assistantMessage}
          isAutoStop={logic.isAutoStop}
          onModeChange={logic.setIsAutoStop}
          onCancel={logic.handleCancelVoice}
          onAction={() =>
            logic.isRecording ? logic.handleStopAndSend() : logic.start()
          }
          skipSpeech={logic.handleSkipSpeech}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1 },
  floatingActions: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "flex-end",
    zIndex: 2,
  },
  menuToggleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    marginTop: 12,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    elevation: 8,
  },
  nearbyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    elevation: 8,
  },
  buttonText: { color: "#fff", marginLeft: 8, fontWeight: "700", fontSize: 10 },
});

export default HomePage;
