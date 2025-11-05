import { SafetyDetailsData } from "@/app/upload/SafetyDetailsScreen";
import { BillType } from "@/app/upload/WeekendPricingScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { Description } from "@/types/ListingDescriptionHighlightsScreen.types";
import { CapacityState } from "@/types/PropertyDetails.types";
import React, { createContext, useState, ReactNode } from "react";
import {
  useCreatePropertyMutation,
  // useUpdatePropertyMutation,
} from "@/services/api";

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
  location?: Address; // ✅ change from string to Address
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
  submitData: () => Promise<SubmitResult>;
  submitDraftData: () => Promise<SubmitResult>;
  // updateProperty: () => Promise<SubmitResult>;
}

export const FormContext = createContext<FormContextType | undefined>(
  undefined
);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FormData>({});
  const [createProperty] = useCreatePropertyMutation();
  const [createDraftProperty] = useCreatePropertyMutation();

  // 🔹 Update specific section of the form
  const updateForm: FormContextType["updateForm"] = (step, values) => {
    setData((prev) => ({ ...prev, [step]: values }));
  };

  // 🔹 Set entire form (used when resuming a draft)
  const setFullFormData: FormContextType["setFullFormData"] = (newData) => {
    setData({ ...newData });
  };

  // 🔹 Helper to safely parse JSON strings to objects
  const parseIfString = <T extends object>(
    value: T | string | undefined
  ): T | undefined => {
    if (!value) return undefined;
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as T;
      } catch {
        return undefined; // fallback if invalid JSON
      }
    }
    return value;
  };

  // 🔹 Prepare data for backend
  const prepareData = (): FormData => ({
    ...data,
    location: parseIfString<Address>(data.location),
    capacityState: parseIfString<CapacityState>(data.capacityState),
    description: parseIfString<Description>(data.description),
    safetyDetailsData: parseIfString<SafetyDetailsData>(data.safetyDetailsData),
    ALL_BILLS: parseIfString<BillType[]>(data.ALL_BILLS),
  });

  // 🔹 Create new published property
  const submitData: FormContextType["submitData"] = async () => {
    try {
      const payload = prepareData();
      const response = await createProperty(payload).unwrap();
      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error submitting property:", error);
      return { success: false, error };
    }
  };

  // 🔹 Save draft
  const submitDraftData: FormContextType["submitDraftData"] = async () => {
    try {
      const payload = prepareData();
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
