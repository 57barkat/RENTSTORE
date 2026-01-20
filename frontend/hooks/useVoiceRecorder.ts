import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";

export const useVoiceRecorder = () => {
  // Pass high quality preset directly
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const start = async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    if (status.granted) {
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      audioRecorder.record();
    }
  };

  const stop = async () => {
    await audioRecorder.stop();
    return audioRecorder.uri;
  };

  return {
    start,
    stop,
    isRecording: audioRecorder.isRecording,
    uri: audioRecorder.uri,
  };
};
