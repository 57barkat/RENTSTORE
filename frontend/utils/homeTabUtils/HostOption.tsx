import React from "react";
import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";

const baseHostOptions = [
  {
    id: "hostel",
    label: "Hostel",
    iconType: "MaterialCommunityIcons",
    iconName: "bed",
  },
  {
    id: "apartment",
    label: "Apartment",
    iconType: "MaterialCommunityIcons",
    iconName: "office-building",
  },
  { id: "home", label: "Home", iconType: "FontAwesome", iconName: "home" },
] as const;

export const withThemeHostOptions = <T extends typeof baseHostOptions>(
  WrappedOptions: T
) => {
  return () => {
    const { theme } = useTheme();
    const currentColors = Colors[theme];

    return WrappedOptions.map((opt) => {
      let IconComponent: any;
      if (opt.iconType === "MaterialCommunityIcons")
        IconComponent = MaterialCommunityIcons;
      if (opt.iconType === "FontAwesome") IconComponent = FontAwesome;

      return {
        ...opt,
        icon: (
          <IconComponent
            name={opt.iconName}
            size={24}
            color={currentColors.secondary}
          />
        ),
      };
    });
  };
};

export const useHostOptions = withThemeHostOptions(baseHostOptions);
