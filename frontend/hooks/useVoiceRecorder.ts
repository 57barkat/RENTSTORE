import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";

export const useVoiceRecorder = () => {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const start = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) return;

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.record();
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stop = async (): Promise<string | null> => {
    try {
      await recorder.stop();
      return recorder.uri; // recorded file URI
    } catch (err) {
      console.error("Failed to stop recording", err);
      return null;
    }
  };

  const play = async (uri: string) => {
    try {
      const soundObject = AudioModule;
      await soundObject.loadAsync({ uri });
      await soundObject.playAsync();
    } catch (err) {
      console.error("Failed to play audio", err);
    }
  };

  return {
    start,
    stop,
    play,
    uri: recorder.uri,
    isRecording: recorder.isRecording,
  };
};
