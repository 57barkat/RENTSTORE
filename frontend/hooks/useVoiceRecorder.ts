import { useState, useEffect } from "react";
import { Audio } from "expo-av";
import { Alert } from "react-native";

export const useVoiceRecorder = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cleanup sound on unmount to prevent memory leaks
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Start recording
  const start = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Denied", "Microphone access is required.");
        return;
      }

      // Essential for iOS to hear/record correctly
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  // Stop recording
  const stop = async () => {
    try {
      if (!recording) return null;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const recordedUri = recording.getURI() ?? null;

      setUri(recordedUri);
      setRecording(null);
      return recordedUri;
    } catch (err) {
      console.error("Failed to stop recording:", err);
      return null;
    }
  };

  // Play the recorded audio
  const play = async () => {
    try {
      if (!uri) return;

      // If a sound is already playing, stop it first
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error("Failed to play recording:", err);
    }
  };

  // Stop playback
  const stopPlayback = async () => {
    if (!sound) return;
    try {
      await sound.stopAsync();
      setIsPlaying(false);
    } catch (err) {
      console.error("Playback stop error:", err);
    }
  };

  return {
    start,
    stop,
    play,
    stopPlayback,
    uri,
    isRecording,
    isPlaying,
  };
};
