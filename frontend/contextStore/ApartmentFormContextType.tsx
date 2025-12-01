import { SafetyDetailsData } from "@/app/upload/SafetyDetailsScreen";
import { BillType } from "@/app/upload/WeekendPricingScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { Description } from "@/types/ListingDescriptionHighlightsScreen.types";
import React, { createContext, useState, ReactNode } from "react";
import { useCreatePropertyMutation } from "@/services/api";

export interface SubmitResult {
  success: boolean;
  data?: any;
  error?: unknown;
}

export interface capacityState {
  Persons?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  floorLevel?: number;
}

// 🔹 Apartment-specific form data
export interface ApartmentFormData {
  _id?: string;
  propertyType?: "apartment";
  title?: string;
  description?: Description;
  address?: Address[];
  hostOption?: string;
  location?: string;
  lat?: number;
  lng?: number;

  // 🔹 Apartment-only fields
  apartmentType?: "studio" | "1BHK" | "2BHK" | "3BHK" | "penthouse";
  capacityState?: capacityState;
  furnishing?: "furnished" | "semi-furnished" | "unfurnished";
  parking?: boolean;

  amenities?: string[];
  photos?: string[];

  securityDeposit?: number;
  monthlyRent?: number;
  dailyRent?: number;
  weeklyRent?: number;

  ALL_BILLS?: BillType[];
  safetyDetailsData?: SafetyDetailsData;
  status?: boolean;
}

export interface ApartmentFormContextType {
  data: ApartmentFormData;
  updateForm: <K extends keyof ApartmentFormData>(
    step: K,
    value: ApartmentFormData[K]
  ) => void;
  setFullFormData: (newData: ApartmentFormData) => void;
  submitData: (overrideData?: ApartmentFormData) => Promise<SubmitResult>;
  submitDraftData: (overrideData?: ApartmentFormData) => Promise<SubmitResult>;
}

export const ApartmentFormContext = createContext<
  ApartmentFormContextType | undefined
>(undefined);

export const ApartmentFormProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [data, setData] = useState<ApartmentFormData>({});

  // ✔ Same logic: one final publish, one draft
  const [createProperty] = useCreatePropertyMutation();
  const [createDraftProperty] = useCreatePropertyMutation();

  // ✔ Update specific field (matches FormContext)
  const updateForm: ApartmentFormContextType["updateForm"] = (step, value) => {
    setData((prev) => ({ ...prev, [step]: value }));
  };

  // ✔ Load full form data (e.g., editing)
  const setFullFormData: ApartmentFormContextType["setFullFormData"] = (
    newData
  ) => {
    setData({ ...newData });
  };

  // ✔ Submit final published apartment
  const submitData: ApartmentFormContextType["submitData"] = async (
    overrideData
  ) => {
    try {
      const payload = overrideData ?? data;

      console.log("🚀 Submitting Apartment:", payload);

      const response = await createProperty({
        ...payload,
        propertyType: "apartment",
      }).unwrap();

      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error submitting apartment:", error);
      return { success: false, error };
    }
  };

  // ✔ Save apartment as a draft (with overrideData support)
  const submitDraftData: ApartmentFormContextType["submitDraftData"] = async (
    overrideData
  ) => {
    try {
      const payload = overrideData ?? data;

      console.log("🗂️ Saving Apartment Draft:", payload);

      const response = await createDraftProperty({
        ...payload,
        propertyType: "apartment",
      }).unwrap();

      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Error saving draft:", error);
      return { success: false, error };
    }
  };

  return (
    <ApartmentFormContext.Provider
      value={{
        data,
        updateForm,
        setFullFormData,
        submitData,
        submitDraftData,
      }}
    >
      {children}
    </ApartmentFormContext.Provider>
  );
};
