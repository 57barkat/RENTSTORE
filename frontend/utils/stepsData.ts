import { StepItemProps } from "@/types/IntroStep1.types";

export const stepsData: StepItemProps[] = [
  {
    stepNumber: 1,
    title: "1. Tell us about your place",
    description:
      "Share some basic info, like where it is and how many guests can stay.",
    iconName: "home-account",
  },
  {
    stepNumber: 2,
    title: "2. Make it stand out",
    description:
      "Add 5 or more photos plus a title and description—we'll help you out.",
    iconName: "camera-burst",
  },
  {
    stepNumber: 3,
    title: "3. Finish up and publish",
    description:
      "Choose a starting price, verify a few details, then publish your listing.",
    iconName: "door-open",
  },
  {
    stepNumber: 4,
    title: "4. Add more details",
    description: "This is an extra step to make the content longer.",
    iconName: "list-status",
  },
  {
    stepNumber: 5,
    title: "5. Final Review",
    description: "One last check before going live.",
    iconName: "check-decagram",
  },
];
