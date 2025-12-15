import { Animated } from "react-native";

export const slideAnimation = (
  slideAnim: Animated.Value,
  isOpen: boolean,
  width: number
) => {
  Animated.timing(slideAnim, {
    toValue: isOpen ? 0 : -width,
    duration: 250,
    useNativeDriver: true,
  }).start();
};
