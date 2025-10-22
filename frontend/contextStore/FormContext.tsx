import { SafetyDetailsData } from "@/app/upload/SafetyDetailsScreen";
import { BillType } from "@/app/upload/WeekendPricingScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { Description } from "@/types/ListingDescriptionHighlightsScreen.types";
import { CapacityState } from "@/types/PropertyDetails.types";
import React, { createContext, useState, ReactNode } from "react";
import { useCreatePropertyMutation } from "@/services/api";

export interface FormData {
  description?: Description;
  address?: Address[];
  hostOption?: string;
  location?: string;
  capacityState?: CapacityState;
  amenities?: string[];
  photos?: string[];
  title?: string;
  SecuritybasePrice?: number;
  ALL_BILLS?: BillType[];
  monthlyRent?: number;
  safetyDetailsData?: SafetyDetailsData;
}

export interface FormContextType {
  data: FormData;
  updateForm: <K extends keyof FormData>(step: K, values: FormData[K]) => void;
  submitData: () => Promise<void>;
}

export const FormContext = createContext<FormContextType | undefined>(
  undefined
);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FormData>({});
  const [createProperty] = useCreatePropertyMutation();
  const updateForm: FormContextType["updateForm"] = async (step, values) => {
    setData((prev) => {
      const newData = { ...prev, [step]: values };
      console.log(newData);
      return newData;
    });
  };
  const submitData = async () => {
    try {
      console.log("Submitting property data:", data);
      await createProperty(data).unwrap();
      console.log("✅ Property created successfully!");
    } catch (error) {
      console.error("❌ Error submitting property:", error);
    }
  };
  return (
    <FormContext.Provider value={{ data, updateForm, submitData }}>
      {children}
    </FormContext.Provider>
  );
};
