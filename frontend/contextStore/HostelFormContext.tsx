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
  hostelType?: "male" | "female" | "mixed"; // hostel type
  location?: string;
   lat?: number; // Latitude from map
  lng?: number;
  capacityState?: CapacityState; // total beds, beds per room, etc.
  amenities?: string[];
  photos?: string[];
  title?: string;
  securityDeposit?: number;
  monthlyRent?: number;
  dailyRent?: number;
  weeklyRent?: number;
  mealPlan?: string[]; // e.g., ["breakfast", "dinner"]
  rules?: string[]; // hostel rules/policies
  safetyDetailsData?: SafetyDetailsData;
  status?: boolean;
  ALL_BILLS?: BillType[]; // optional
}

export interface HostelFormContextType {
  data: HostelFormData;
  updateForm: <K extends keyof HostelFormData>(
    step: K,
    values: HostelFormData[K]
  ) => void;
  setFullFormData: (newData: HostelFormData) => void;
  submitData: (overrideData?: HostelFormData) => Promise<SubmitResult>;
  submitDraftData: () => Promise<SubmitResult>;
}

export const HostelFormContext = createContext<
  HostelFormContextType | undefined
>(undefined);

export const HostelFormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<HostelFormData>({});
  const [createProperty] = useCreatePropertyMutation();
  const [createDraftProperty] = useCreatePropertyMutation();

  // 🔹 Update a specific field/step
  const updateForm: HostelFormContextType["updateForm"] = (step, values) => {
    setData((prev) => {
      const newData = { ...prev, [step]: values };
      console.log("📝 Updated Hostel Form Data:", newData);
      return newData;
    });
  };

  // 🔹 Load full draft form
  const setFullFormData: HostelFormContextType["setFullFormData"] = (
    newData
  ) => {
    console.log("📥 Loaded hostel draft data:", newData);
    setData({ ...newData });
  };

  // 🔹 Submit hostel property
  const submitData: HostelFormContextType["submitData"] = async (
    overrideData?: HostelFormData
  ) => {
    try {
      const payload = overrideData ?? data;
      console.log("🚀 Submitting hostel data:", data);
      const response = await createDraftProperty({
        ...payload,
        propertyType: "hostel",
      }).unwrap();
      console.log("✅ Hostel created successfully!", response);
      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error submitting hostel:", error);
      return { success: false, error };
    }
  };

  // 🔹 Save draft hostel property
  const submitDraftData: HostelFormContextType["submitDraftData"] =
    async () => {
      try {
        console.log("🗂️ Saving hostel draft data:", data);
        const response = await createDraftProperty(data).unwrap();
        console.log("✅ Draft saved successfully!", response);
        return { success: true, data: response };
      } catch (error) {
        console.error("❌ Error saving draft:", error);
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
