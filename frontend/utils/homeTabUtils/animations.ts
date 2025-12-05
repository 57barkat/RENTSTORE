import { Animated } from "react-native";

export const startPulseAnimation = (animValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ])
  );
};
