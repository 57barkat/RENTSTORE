import React, { useState } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  RefreshControl,
  Animated,
  Pressable,
  Text,
} from "react-native";
import SearchBar from "@/components/Filters/SearchBar";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import HostOptionsRowProps from "@/components/Filters/HostOptions";
import AdsSliderProps from "@/components/Filters/AdsSlider";
import { PropertySection } from "@/components/Filters/PropertySection";
import VoiceAssistant from "@/components/Assistant/VoiceAssistant";
import { useHomePageLogic } from "@/hooks/useHomePageLogic";
import { getSectionsData } from "@/utils/homeTabUtils/homeHelpers";
import PhoneVerificationBanner from "@/components/VerificationBanner";
import { useAuth } from "@/contextStore/AuthContext";
import AuthModal from "@/components/AuthModal";
import { Ionicons } from "@expo/vector-icons";

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const logic = useHomePageLogic();
  const { isGuest } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState("");

  const triggerAuthModal = (feature: string) => {
    setActiveFeature(feature);
    setModalVisible(true);
  };

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

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="business-outline" size={80} color={currentTheme.muted} />
      <Text style={[styles.emptyTitle, { color: currentTheme.text }]}>
        No Properties Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: currentTheme.muted }]}>
        We couldn&lsquo;t find any listings right now. Please pull down to
        refresh or check back later.
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !logic.homesLoading && !logic.roomsLoading && !logic.apartmentsLoading
            ? EmptyListComponent
            : null
        }
        refreshControl={
          <RefreshControl
            refreshing={logic.refreshing}
            onRefresh={logic.onRefresh}
            tintColor={currentTheme.secondary}
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
              if (isGuest) {
                triggerAuthModal("Favorites");
                return;
              }

              const isFav = logic.favoriteIds?.some(
                (favId: any) => String(favId) === String(id),
              );

              if (isFav) {
                await logic.removeUserFavorite({ propertyId: id });
              } else {
                await logic.addToFav({ propertyId: id });
              }

              logic.refetchFavorites();
            }}
          />
        )}
      />

      <AuthModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        featureName={activeFeature}
      />

      {logic.isMenuOpen && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        >
          <Pressable style={{ flex: 1 }} onPress={logic.toggleMenu} />
        </Animated.View>
      )}

      {/* {!showAssistant && (
        <View style={styles.floatingActions}>
          <Animated.View style={[actionStyle, { gap: 12 }]}>
            <TouchableOpacity
              style={[
                styles.nearbyButton,
                { backgroundColor: currentTheme.secondary },
              ]}
              onPress={() => {
                logic.toggleMenu();
                if (isGuest) {
                  triggerAuthModal("Nearby Search");
                } else {
                  router.push("/NearbyScreen");
                }
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
              onPress={() => {
                if (isGuest) {
                  logic.toggleMenu();
                  triggerAuthModal("AI Matcher");
                } else {
                  logic.handleStartAI();
                }
              }}
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
      )} */}

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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    opacity: 0.7,
  },
});

export default HomePage;
