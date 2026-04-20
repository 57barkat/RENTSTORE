import { ReactNode } from "react";

export interface StepContainerProps {
  title?: string;
  showBack?: boolean;
  children: ReactNode;
  onNext: () => void;
  isNextDisabled?: boolean;
  progress?: number;
  nextDisabledReason?: string;
  stepNumber?: number;
  totalSteps?: number;
}
