import { SafetyDetailsData } from "@/app/upload/SafetyDetailsScreen";
import { BillType } from "@/app/upload/WeekendPricingScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { Description } from "@/types/ListingDescriptionHighlightsScreen.types";
import { CapacityState } from "@/types/PropertyDetails.types";
import React, { createContext, useState, ReactNode } from "react";
import { useCreatePropertyMutation } from "@/services/api";

export interface SubmitResult {
  success: boolean;
  data?: any;
  error?: unknown;
}

// 🔹 Hostel-specific form data
export interface HostelFormData {
  _id?: string;
  hostOption?: string;
  description?: Description;
  address?: Address[];
  hostelType?: "male" | "female" | "mixed";
  location?: string;
  lat?: number;
  lng?: number;
  capacityState?: CapacityState;
  amenities?: string[];
  photos?: string[];
  title?: string;
  securityDeposit?: number;
  monthlyRent?: number;
  dailyRent?: number;
  weeklyRent?: number;
  mealPlan?: string[];
  rules?: string[];
  safetyDetailsData?: SafetyDetailsData;
  status?: boolean;
  ALL_BILLS?: BillType[];
}

export interface HostelFormContextType {
  data: HostelFormData;
  updateForm: <K extends keyof HostelFormData>(
    step: K,
    values: HostelFormData[K]
  ) => void;
  setFullFormData: (newData: HostelFormData) => void;
  submitData: (overrideData?: HostelFormData) => Promise<SubmitResult>;
  submitDraftData: (overrideData?: HostelFormData) => Promise<SubmitResult>;
}

export const HostelFormContext = createContext<
  HostelFormContextType | undefined
>(undefined);

export const HostelFormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<HostelFormData>({});

  // ✔ Same API logic (one for final create, one for draft)
  const [createProperty] = useCreatePropertyMutation();
  const [createDraftProperty] = useCreatePropertyMutation();

  // ✔ Same update logic as FormContext
  const updateForm: HostelFormContextType["updateForm"] = (step, values) => {
    setData((prev) => ({ ...prev, [step]: values }));
  };

  // ✔ Replace full form data (for edit mode/draft loading)
  const setFullFormData: HostelFormContextType["setFullFormData"] = (
    newData
  ) => {
    setData({ ...newData });
  };

  // ✔ FINAL submission (same as property)
  const submitData: HostelFormContextType["submitData"] = async (
    overrideData
  ) => {
    try {
      const payload: HostelFormData = overrideData ?? data;

      console.log("🚀 Submitting hostel data:", payload);

      const response = await createProperty({
        ...payload,
        propertyType: "hostel",
      }).unwrap();

      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error submitting hostel:", error);
      return { success: false, error };
    }
  };

  // ✔ SAVE DRAFT (same overrideData pattern as FormContext)
  const submitDraftData: HostelFormContextType["submitDraftData"] = async (
    overrideData
  ) => {
    try {
      const payload: HostelFormData = overrideData ?? data;

      console.log("🗂️ Saving hostel draft:", payload);

      const response = await createDraftProperty({
        ...payload,
        propertyType: "hostel",
      }).unwrap();

      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error saving draft hostel:", error);
      return { success: false, error };
    }
  };

  return (
    <HostelFormContext.Provider
      value={{
        data,
        updateForm,
        setFullFormData,
        submitData,
        submitDraftData,
      }}
    >
      {children}
    </HostelFormContext.Provider>
  );
};
