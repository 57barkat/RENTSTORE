import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";

const { width, height } = Dimensions.get("window");

interface VoiceAssistantProps {
  currentTheme: any;
  isProcessing: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  timerCount: number;
  assistantMessage: string | null;
  onCancel: () => void;
  onAction: () => void;
  isAutoStop: boolean;
  onModeChange: (val: boolean) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  currentTheme,
  isProcessing,
  isRecording,
  isSpeaking,
  timerCount,
  assistantMessage,
  onCancel,
  onAction,
  isAutoStop,
  onModeChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording || isSpeaking || isProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, isSpeaking, isProcessing]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={isDark ? 60 : 95}
        style={StyleSheet.absoluteFill}
        tint={isDark ? "dark" : "light"}
      />

      <View style={styles.container}>
        {/* Top Row */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.modeContainer,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => onModeChange(true)}
              style={[
                styles.modeTab,
                isAutoStop && { backgroundColor: currentTheme.primary },
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  { color: isAutoStop ? "#FFF" : currentTheme.text },
                ]}
              >
                Auto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onModeChange(false)}
              style={[
                styles.modeTab,
                !isAutoStop && { backgroundColor: currentTheme.primary },
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  { color: !isAutoStop ? "#FFF" : currentTheme.text },
                ]}
              >
                Manual
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onCancel}>
            <Ionicons
              name="close-circle-outline"
              size={32}
              color={currentTheme.text}
              style={{ opacity: 0.5 }}
            />
          </TouchableOpacity>
        </View>

        {/* Orb */}
        <View style={styles.orbContainer}>
          <Animated.View
            style={[
              styles.mainOrb,
              {
                transform: [{ scale: pulseAnim }],
                borderColor: isRecording ? "#FF4444" : currentTheme.primary,
                shadowColor: isRecording ? "#FF4444" : currentTheme.primary,
                backgroundColor: isDark ? "#1A1A1A" : "#FFF",
              },
            ]}
          >
            <View
              style={[
                styles.innerGlow,
                {
                  backgroundColor: isRecording
                    ? "#FF4444"
                    : currentTheme.primary,
                  opacity: 0.1,
                },
              ]}
            />
            <Ionicons
              name={
                isRecording
                  ? "mic"
                  : isProcessing
                    ? "hourglass"
                    : "sparkles-outline"
              }
              size={54}
              color={isRecording ? "#FF4444" : currentTheme.primary}
            />
          </Animated.View>
        </View>

        <View style={styles.textContainer}>
          <ScrollView
            style={{ maxHeight: 120 }}
            contentContainerStyle={{ alignItems: "center" }}
          >
            <Text
              style={[styles.messageText, { color: currentTheme.text }]}
              numberOfLines={4}
              ellipsizeMode="tail"
            >
              {assistantMessage || "I'm listening..."}
            </Text>
          </ScrollView>
          {isRecording && (
            <Text
              style={[
                styles.subText,
                { color: isRecording ? "#FF4444" : currentTheme.text },
              ]}
            >
              {isAutoStop
                ? "Will send after you pause"
                : `Recording: ${timerCount}s`}
            </Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.sideCircle} onPress={onCancel}>
            <Ionicons
              name="refresh-outline"
              size={24}
              color={currentTheme.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: isRecording ? "#FF4444" : currentTheme.primary,
              },
            ]}
            onPress={onAction}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={36}
                color="#FFF"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideCircle}>
            <Ionicons
              name="chatbubbles-outline"
              size={24}
              color={currentTheme.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 60,
    paddingHorizontal: 25,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modeContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 3,
    width: 140,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 18,
  },
  modeText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  orbContainer: { alignItems: "center", justifyContent: "center", height: 250 },
  mainOrb: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    justifyContent: "center",
    alignItems: "center",
    elevation: 15,
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  innerGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 90 },
  textContainer: { alignItems: "center", paddingHorizontal: 20 },
  messageText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 32,
  },
  subText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.6,
    letterSpacing: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
  },
  sideCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VoiceAssistant;
