import { itemStyles } from "@/styles/IntroStep1";
import { StepItemProps } from "@/types/IntroStep1.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FC } from "react";
import { Dimensions, Text, View } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const { width: screenWidth } = Dimensions.get("window");

export const StepItem: FC<StepItemProps> = ({
  stepNumber,
  title,
  description,
  iconName,
}) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const isNarrow = screenWidth < 350;
  const iconSize = screenWidth * 0.18;

  return (
    <View
      style={[
        itemStyles.stepContainer,
        {
          flexDirection: isNarrow ? "column" : "row",
          alignItems: isNarrow ? "flex-start" : "center",
        },
      ]}
    >
      <View
        style={[
          itemStyles.textContainer,
          { paddingRight: isNarrow ? 0 : 20, marginBottom: isNarrow ? 10 : 0 },
        ]}
      >
        <Text style={[itemStyles.stepTitle, { color: currentTheme.text }]}>
          {title}
        </Text>
        <Text
          style={[itemStyles.stepDescription, { color: currentTheme.muted }]}
        >
          {description}
        </Text>
      </View>
      <MaterialCommunityIcons
        name={iconName}
        size={iconSize}
        color={currentTheme.primary}
        style={itemStyles.stepIcon}
      />
    </View>
  );
};
