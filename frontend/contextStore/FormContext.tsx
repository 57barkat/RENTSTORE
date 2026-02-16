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

export interface FormData {
  _id?: string;
  propertyType?: "apartment" | "hostel" | "home";
  title?: string;
  description?: Description;
  address?: Address[];
  hostOption?: string;
  location?: string;
  lat?: number;
  lng?: number;
  area?: string;
  capacityState?: CapacityState;
  amenities?: string[];
  photos?: string[];
  monthlyRent?: number;
  dailyRent?: number;
  weeklyRent?: number;
  securityDeposit?: number;
  ALL_BILLS?: BillType[];
  safetyDetailsData?: SafetyDetailsData;
  status?: boolean;

  SecuritybasePrice?: number;

  apartmentType?: "studio" | "1BHK" | "2BHK" | "3BHK" | "penthouse";
  furnishing?: "furnished" | "semi-furnished" | "unfurnished";
  parking?: boolean;

  hostelType?: "male" | "female" | "mixed";
  mealPlan?: string[];
  rules?: string[];
}

export interface FormContextType {
  data: FormData;
  updateForm: <K extends keyof FormData>(step: K, values: FormData[K]) => void;
  setFullFormData: (newData: FormData) => void;
  submitData: (overrideData?: FormData) => Promise<SubmitResult>;
  submitDraftData: (overrideData?: FormData) => Promise<SubmitResult>;
  clearForm: () => void;
}

export const FormContext = createContext<FormContextType | undefined>(
  undefined,
);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FormData>({});

  const [createProperty] = useCreatePropertyMutation();

  const updateForm: FormContextType["updateForm"] = (step, values) => {
    setData((prev) => ({ ...prev, [step]: values }));
  };

  const setFullFormData: FormContextType["setFullFormData"] = (newData) => {
    setData({ ...newData });
  };
  console.log("🔄 FormContext data updated:", data);
  const submitData: FormContextType["submitData"] = async (overrideData) => {
    try {
      const payload = overrideData ?? data;
      console.log("🚀 Submitting FINAL property:", payload);
      const response = await createProperty(payload).unwrap();
      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error submitting:", error);
      return { success: false, error };
    }
  };

  const submitDraftData: FormContextType["submitDraftData"] = async (
    overrideData,
  ) => {
    try {
      const payload = overrideData ?? data;
      console.log("🗂️ Saving DRAFT:", payload);
      const response = await createProperty(payload).unwrap();
      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error saving draft:", error);
      return { success: false, error };
    }
  };

  const clearForm = () => {
    setData({});
  };

  return (
    <FormContext.Provider
      value={{
        data,
        updateForm,
        setFullFormData,
        submitData,
        submitDraftData,
        clearForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
