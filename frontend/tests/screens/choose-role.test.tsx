import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChooseRoleScreen from "@/app/choose-role";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/contextStore/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
  }),
}));

describe("ChooseRoleScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores the user role flow and navigates to signup", async () => {
    const screen = render(<ChooseRoleScreen />);

    fireEvent.press(screen.getByText("I'm Looking for a Property"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("userRole", "user");
      expect(mockPush).toHaveBeenCalledWith("/signup");
    });
  });

  it("stores the posting flow as agent for signup", async () => {
    const screen = render(<ChooseRoleScreen />);

    fireEvent.press(screen.getByText("I'm Posting My Property"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("userRole", "agent");
      expect(mockPush).toHaveBeenCalledWith("/signup");
    });
  });
});
