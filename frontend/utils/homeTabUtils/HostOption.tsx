import React from "react";
import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";

const baseHostOptions = [
  {
    id: "hostel",
    label: "Hostel",
    Icon: MaterialCommunityIcons,
    iconName: "bed",
  },
  {
    id: "apartment",
    label: "Apartment",
    Icon: MaterialCommunityIcons,
    iconName: "office-building",
  },
  {
    id: "home",
    label: "Home",
    Icon: FontAwesome,
    iconName: "home",
  },
  {
    id: "shop",
    label: "Shop",
    Icon: MaterialCommunityIcons,
    iconName: "storefront",
  },
  {
    id: "office",
    label: "Office",
    Icon: MaterialCommunityIcons,
    iconName: "briefcase",
  },
] as const;

export const withThemeHostOptions = <T extends typeof baseHostOptions>(
  WrappedOptions: T,
) => {
  return () => {
    const { theme } = useTheme();
    const currentColors = Colors[theme];

    return WrappedOptions.map((opt) => {
      const IconComponent = opt.Icon;

      return {
        ...opt,
        icon: (
          <IconComponent
            name={opt.iconName as any}
            size={20}
            color={currentColors.secondary}
          />
        ),
      };
    });
  };
};

export const useHostOptions = withThemeHostOptions(baseHostOptions);
