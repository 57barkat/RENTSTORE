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
  location?: string;
  capacityState?: CapacityState;
  amenities?: string[];
  photos?: string[];
  title?: string;
  SecuritybasePrice?: number;
  ALL_BILLS?: BillType[];
  monthlyRent?: number;
  safetyDetailsData?: SafetyDetailsData;
  status?:boolean;
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
  // const [updatePropertyMutation] = useUpdatePropertyMutation();
  console.log(">>>>>>>>>>>><<<<<<<<<<<<<<<<<", data);
  // 🔹 Update specific section of the form
  const updateForm: FormContextType["updateForm"] = (step, values) => {
    setData((prev) => {
      const newData = { ...prev, [step]: values };
      console.log("📝 Updated Form Data:", newData);
      return newData;
    });
  };

  // 🔹 Set entire form (used when resuming a draft)
  const setFullFormData: FormContextType["setFullFormData"] = (newData) => {
    console.log("📥 Loaded draft data into form:", newData);
    setData({...newData});
  };

  // 🔹 Create new published property
  const submitData: FormContextType["submitData"] = async () => {
    try {
      console.log("🚀 Submitting property data:", data);
      const response = await createProperty(data).unwrap();
      console.log("✅ Property created successfully!", response);
      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error submitting property:", error);
      return { success: false, error };
    }
  };

  // 🔹 Save draft
  const submitDraftData: FormContextType["submitDraftData"] = async () => {
    try {
      console.log("🗂️ Saving draft property data:", data);
      const response = await createDraftProperty(data).unwrap();
      console.log("✅ Draft saved successfully!", response);
      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error saving draft:", error);
      return { success: false, error };
    }
  };

  // 🔹 Update existing draft/property
  // const updateProperty: FormContextType["updateProperty"] = async () => {
  //   if (!data._id) {
  //     console.warn("⚠️ No _id found, cannot update property.");
  //     return { success: false, error: "Missing property ID" };
  //   }

  //   try {
  //     console.log(`🔄 Updating property with ID: ${data._id}`, data);
  //     // const response = await updatePropertyMutation({
  //     //   id: data._id,
  //     //   body: data,
  //     // }).unwrap();
  //     // console.log("✅ Property updated successfully!", response);
  //     // return { success: true, data: response };
  //   } catch (error) {
  //     console.error("❌ Error updating property:", error);
  //     return { success: false, error };
  //   }
  // };

  return (
    <FormContext.Provider
      value={{
        data,
        updateForm,
        setFullFormData,
        submitData,
        submitDraftData,
        // updateProperty,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
