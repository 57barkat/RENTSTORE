(globalThis as { __DEV__?: boolean }).__DEV__ = false;

jest.mock(
  "@react-native-async-storage/async-storage",
  () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-secure-store", () => ({
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: "AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY",
  isAvailableAsync: jest.fn(async () => true),
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-font", () => ({
  useFonts: jest.fn(() => [true]),
}));

jest.mock("expo-navigation-bar", () => ({
  setVisibilityAsync: jest.fn(async () => undefined),
  setBehaviorAsync: jest.fn(async () => undefined),
  setBackgroundColorAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-status-bar", () => {
  const React = require("react");
  return {
    StatusBar: () => React.createElement("StatusBar"),
  };
});

jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      apiUrl: "https://example.test",
    },
  },
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const Icon = ({ name }: { name?: string }) =>
    React.createElement(Text, null, name ?? "icon");

  return {
    Feather: Icon,
    MaterialCommunityIcons: Icon,
  };
});

jest.mock("react-native-paper", () => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");

  return {
    Checkbox: ({
      status,
      onPress,
    }: {
      status: "checked" | "unchecked";
      onPress: () => void;
    }) =>
      React.createElement(
        TouchableOpacity,
        { onPress },
        React.createElement(Text, null, status),
      ),
  };
});

jest.mock("react-redux", () => {
  const React = require("react");

  return {
    Provider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock("react-native-toast-message", () => {
  const React = require("react");
  const Toast = () => null;
  Toast.show = jest.fn();
  return {
    __esModule: true,
    default: Toast,
  };
});

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

jest.mock("@rnmapbox/maps", () => ({}));
jest.mock("@maplibre/maplibre-react-native", () => ({}));
