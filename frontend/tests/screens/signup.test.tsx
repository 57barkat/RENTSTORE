import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import SignUpScreen from "@/app/signup";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockShowErrorToast = jest.fn();
const mockShowSuccessToast = jest.fn();
const mockCreateUserMutation = jest.fn();
const mockVerifyEmailMutation = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

jest.mock("@/contextStore/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
  }),
}));

jest.mock("@/services/api", () => ({
  useCreateUserMutation: () => [mockCreateUserMutation, { isLoading: false }],
  useVerifyEmailMutation: () => [mockVerifyEmailMutation, { isLoading: false }],
}));

jest.mock("@/utils/toast", () => ({
  showErrorToast: (...args: unknown[]) => mockShowErrorToast(...args),
  showSuccessToast: (...args: unknown[]) => mockShowSuccessToast(...args),
}));

jest.mock("@/components/TermsModal", () => () => null);

jest.mock("@/components/TermsCheckbox", () => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");

  return {
    TermsCheckbox: ({
      acceptedTerms,
      setAcceptedTerms,
    }: {
      acceptedTerms: boolean;
      setAcceptedTerms: (value: boolean) => void;
    }) =>
      React.createElement(
        TouchableOpacity,
        { onPress: () => setAcceptedTerms(!acceptedTerms) },
        React.createElement(Text, null, "Accept Terms"),
      ),
  };
});

jest.mock("@/components/VerificationModal", () => {
  const React = require("react");
  const { Text, TextInput, TouchableOpacity, View } = require("react-native");

  return ({
    visible,
    code,
    setCode,
    onVerify,
  }: {
    visible: boolean;
    code: string;
    setCode: (text: string) => void;
    onVerify: () => void;
  }) =>
    visible ? (
      <View>
        <Text>Verify Signup Email</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Signup Verification Code"
        />
        <TouchableOpacity onPress={onVerify}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </View>
    ) : null;
});

describe("SignUpScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) =>
      key === "userRole" ? "renter" : null,
    );
  });

  const fillRequiredFields = (screen: ReturnType<typeof render>) => {
    fireEvent.changeText(screen.getByPlaceholderText("Full Name"), "Test User");
    fireEvent.changeText(
      screen.getByPlaceholderText("Email Address"),
      "user@example.com",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Phone Number"),
      "03123456789",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("CNIC Number"),
      "1234512345671",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Password"),
      "password123",
    );
  };

  it("hydrates the legacy renter role as agent", async () => {
    const screen = render(<SignUpScreen />);

    await waitFor(() => {
      expect(screen.getByText("Join as a professional agent")).toBeTruthy();
    });
  });

  it("requires terms acceptance before signup", async () => {
    mockCreateUserMutation.mockReturnValue({
      unwrap: async () => undefined,
    });

    const screen = render(<SignUpScreen />);
    fillRequiredFields(screen);
    fireEvent.press(screen.getByText("Sign Up"));

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Required",
        "Please accept Terms and Conditions",
      );
    });
  });

  it("submits signup, opens verification, and routes to signin after email verification", async () => {
    mockCreateUserMutation.mockReturnValue({
      unwrap: async () => undefined,
    });
    mockVerifyEmailMutation.mockReturnValue({
      unwrap: async () => undefined,
    });

    const screen = render(<SignUpScreen />);
    await waitFor(() => {
      expect(screen.getByText("Join as a professional agent")).toBeTruthy();
    });
    fillRequiredFields(screen);
    fireEvent.press(screen.getByText("Accept Terms"));
    fireEvent.press(screen.getByText("Sign Up"));

    await waitFor(() => {
      expect(mockCreateUserMutation).toHaveBeenCalledWith({
        acceptedTerms: true,
        agencyLicense: "",
        agencyName: "",
        cnic: "1234512345671",
        confirmPassword: "",
        email: "user@example.com",
        name: "Test User",
        password: "password123",
        phone: "03123456789",
        role: "agent",
      });
      expect(mockShowSuccessToast).toHaveBeenCalledWith(
        "Verification Sent",
        "Check your email",
      );
      expect(screen.getByText("Verify Signup Email")).toBeTruthy();
    });

    fireEvent.changeText(
      screen.getByPlaceholderText("Signup Verification Code"),
      "123456",
    );
    fireEvent.press(screen.getByText("Verify"));

    await waitFor(() => {
      expect(mockVerifyEmailMutation).toHaveBeenCalledWith({
        email: "user@example.com",
        code: "123456",
      });
      expect(mockReplace).toHaveBeenCalledWith("/signin");
    });
  });
});
