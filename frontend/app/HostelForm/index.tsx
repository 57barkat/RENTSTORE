import React, { useState, useContext } from "react";
import { FormContext } from "@/contextStore/HostelFormContext";
import Step1BasicInfo from "./steps/Step1";
import Step2Location from "./steps/Step2";
import Step3Capacity from "./steps/Step3";
import Step4DescriptionHighlights from "./steps/Step4";
import Step5RulesPolicies from "./steps/Step5";
import Step6AmenitiesSafety from "./steps/Step6";
import Step7Photos from "./steps/Step7";
import StepContainer from "./StepContainer";
import { router } from "expo-router";

export default function HostelForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const { submitData, submitDraftData } = useContext(FormContext)!;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const progress = (step / totalSteps) * 100;

  // --- Submission Handlers ---
  const handleDraftSave = async () => {
    try {
      await submitDraftData();
      console.log("✅ Draft saved successfully");
    } catch (err) {
      console.error("❌ Draft save failed:", err);
    }
  };

  const handlePublish = async () => {
    try {
      await submitData();
      console.log("🚀 Hostel published successfully");
      router.push("/upload")
    } catch (err) {
      console.error("❌ Publish failed:", err);
    }
  };

  // --- Step Renderer ---
  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1BasicInfo />;
      case 2:
        return <Step2Location />;
      case 3:
        return <Step3Capacity />;
      case 4:
        return <Step4DescriptionHighlights />;
      case 5:
        return <Step5RulesPolicies />;
      case 6:
        return <Step6AmenitiesSafety />;
      case 7:
        return <Step7Photos />;
      default:
        return null;
    }
  };

  return (
    <StepContainer
      title={`Step ${step} of ${totalSteps}`}
      progress={progress}
      showBack={step > 1}
      onNext={step === totalSteps ? handlePublish : nextStep}
      onBack={prevStep}
      onDraft={step < totalSteps ? handleDraftSave : undefined}
      onPublish={step === totalSteps ? handlePublish : undefined}
    >
      {renderStep()}
    </StepContainer>
  );
}
