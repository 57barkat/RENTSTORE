import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 375;

export function normalize(size: number) {
  const newSize = size * scale;
  return Math.round(PixelRatio.getFontScale() * newSize);
}

export const FontFamily = {
  regular: "Roboto_400Regular",
  medium: "Roboto_500Medium",
  bold: "Roboto_700Bold",
  black: "Roboto_900Black",
};

export const FontSize = {
  xs: normalize(10),
  sm: normalize(14),
  base: normalize(16),
  md: normalize(18),
  lg: normalize(20),
  xl: normalize(24),
  xxl: normalize(30),
  xxxl: normalize(36),
  display: normalize(48),
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const Typography = {
  h1: {
    fontSize: FontSize.xxxl,
    lineHeight: FontSize.xxxl * LineHeight.tight,
    fontFamily: FontFamily.black,
  },
  h2: {
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl * LineHeight.tight,
    fontFamily: FontFamily.bold,
  },
  h3: {
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * LineHeight.tight,
    fontFamily: FontFamily.bold,
  },
  h4: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * LineHeight.tight,
    fontFamily: FontFamily.bold,
  },
  h5: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * LineHeight.tight,
    fontFamily: FontFamily.medium,
  },
  h6: {
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.tight,
    fontFamily: FontFamily.medium,
  },
  body: {
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.normal,
    fontFamily: FontFamily.regular,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * LineHeight.normal,
    fontFamily: FontFamily.regular,
  },
  labelLarge: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.normal,
    fontFamily: FontFamily.regular,
    letterSpacing: 0.4,
  },
  button: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
};
