import { Colors as AppColors } from "@/constants/Colors";

export const getColors = (theme: "light" | "dark") => ({
  primary: AppColors[theme].primary,
  secondary: AppColors[theme].secondary,
  background: AppColors[theme].background,
  card: AppColors[theme].card,
  danger: AppColors[theme].danger,
});
