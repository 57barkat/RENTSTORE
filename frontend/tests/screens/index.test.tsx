import React from "react";
import { render } from "@testing-library/react-native";
import IndexScreen from "@/app/index";

jest.mock("@/app/homePage", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return () => React.createElement(Text, null, "Home Page Screen");
});

describe("IndexScreen", () => {
  it("renders the startup route", () => {
    const screen = render(<IndexScreen />);

    expect(screen.getByText("Home Page Screen")).toBeTruthy();
  });
});
