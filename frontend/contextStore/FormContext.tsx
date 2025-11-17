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
  description?: Description;
  address?: Address[];
  hostOption?: string;
  location?: string; // Human-readable address
  lat?: number; // Latitude from map
  lng?: number; // Longitude from map
  capacityState?: CapacityState;
  amenities?: string[];
  photos?: string[];
  title?: string;
  SecuritybasePrice?: number;
  ALL_BILLS?: BillType[];
  monthlyRent?: number;
  safetyDetailsData?: SafetyDetailsData;
  status?: boolean;
}

export interface FormContextType {
  data: FormData;
  updateForm: <K extends keyof FormData>(step: K, values: FormData[K]) => void;
  setFullFormData: (newData: FormData) => void;
  submitData: (overrideData?: FormData) => Promise<SubmitResult>;
  submitDraftData: (overrideData?: FormData) => Promise<SubmitResult>;
}

export const FormContext = createContext<FormContextType | undefined>(
  undefined
);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FormData>({});
  const [createProperty] = useCreatePropertyMutation();
  const [createDraftProperty] = useCreatePropertyMutation();

  const updateForm: FormContextType["updateForm"] = (step, values) => {
    setData((prev) => ({ ...prev, [step]: values }));
  };

  const setFullFormData: FormContextType["setFullFormData"] = (newData) => {
    setData({ ...newData });
  };

  const submitData: FormContextType["submitData"] = async (overrideData) => {
    try {
      const payload = overrideData ?? data;

      console.log("🚀 Submitting property data:", payload);

      const response = await createProperty(payload).unwrap();

      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error submitting property:", error);
      return { success: false, error };
    }
  };

  const submitDraftData: FormContextType["submitDraftData"] = async (
    overrideData
  ) => {
    try {
      const payload = overrideData ?? data;

      console.log("🗂️ Saving draft property data:", payload);

      const response = await createDraftProperty(payload).unwrap();

      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error saving draft:", error);
      return { success: false, error };
    }
  };

  return (
    <FormContext.Provider
      value={{
        data,
        updateForm,
        setFullFormData,
        submitData,
        submitDraftData,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
