import { ReactNode } from "react";

export interface StepContainerProps {
  title?: string;
  showBack?: boolean;
  children: ReactNode;
  onNext: () => void;
  isNextDisabled?: boolean;
  progress?: number; // value between 0–100
}
