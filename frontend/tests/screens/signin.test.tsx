import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import SignInScreen from "@/app/signin";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockLogin = jest.fn(async () => undefined);
const mockShowErrorToast = jest.fn();
const mockShowSuccessToast = jest.fn();
const mockLoginMutation = jest.fn();
const mockVerifyEmailMutation = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

jest.mock("@/contextStore/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: mockLogin,
  }),
}));

jest.mock("@/contextStore/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
  }),
}));

jest.mock("@/services/api", () => ({
  useLoginMutation: () => [mockLoginMutation, { isLoading: false }],
  useVerifyEmailMutation: () => [mockVerifyEmailMutation, { isLoading: false }],
}));

jest.mock("@/utils/toast", () => ({
  showErrorToast: (...args: unknown[]) => mockShowErrorToast(...args),
  showSuccessToast: (...args: unknown[]) => mockShowSuccessToast(...args),
}));

jest.mock("@/components/ForgotPasswordModal", () => () => null);

jest.mock("@/components/VerificationModal", () => {
  const React = require("react");
  const { Text, TextInput, TouchableOpacity, View } = require("react-native");

  return ({
    visible,
    email,
    code,
    setCode,
    onVerify,
  }: {
    visible: boolean;
    email: string;
    code: string;
    setCode: (text: string) => void;
    onVerify: () => void;
  }) =>
    visible ? (
      <View>
        <Text>Verification Modal</Text>
        <Text>{email}</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Verification Code"
        />
        <TouchableOpacity onPress={onVerify}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </View>
    ) : null;
});

describe("SignInScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login screen", () => {
    const screen = render(<SignInScreen />);

    expect(screen.getByText("Welcome Back")).toBeTruthy();
    expect(screen.getByText("Login to continue")).toBeTruthy();
  });

  it("shows a toast when required fields are missing", async () => {
    const screen = render(<SignInScreen />);

    fireEvent.press(screen.getByText("Login"));

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Required",
        "Please enter email and password",
      );
    });
  });

  it("redirects unverified phone users even when the API response uses isphoneverified", async () => {
    mockLoginMutation.mockReturnValue({
      unwrap: async () => ({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "1", name: "User", email: "user@example.com" },
        isphoneverified: false,
      }),
    });

    const screen = render(<SignInScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Email or Phone"),
      "user@example.com",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Password"),
      "password123",
    );
    fireEvent.press(screen.getByText("Login"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Phone Not Verified",
        "Please verify your phone number to continue.",
      );
      expect(mockPush).toHaveBeenCalledWith("/Verification");
    });
  });

  it("opens email verification and completes login after code verification", async () => {
    mockLoginMutation.mockReturnValue({
      unwrap: async () => {
        throw {
          data: {
            message: "VERIFY_EMAIL_REQUIRED",
          },
        };
      },
    });
    mockVerifyEmailMutation.mockReturnValue({
      unwrap: async () => ({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "1", name: "User", email: "user@example.com" },
        isPhoneVerified: true,
      }),
    });

    const screen = render(<SignInScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Email or Phone"),
      "user@example.com",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Password"),
      "password123",
    );
    fireEvent.press(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Verification Modal")).toBeTruthy();
      expect(screen.getByText("user@example.com")).toBeTruthy();
    });

    fireEvent.changeText(
      screen.getByPlaceholderText("Verification Code"),
      "123456",
    );
    fireEvent.press(screen.getByText("Verify"));

    await waitFor(() => {
      expect(mockVerifyEmailMutation).toHaveBeenCalledWith({
        email: "user@example.com",
        code: "123456",
      });
      expect(mockShowSuccessToast).toHaveBeenCalledWith(
        "Email Verified",
        "You are now logged in.",
      );
      expect(mockReplace).toHaveBeenCalledWith("/homePage");
    });
  });
});
