import { MaterialCommunityIcons } from "@expo/vector-icons";

export type StepItemProps = {
  stepNumber: number;
  title: string;
  description: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
};
