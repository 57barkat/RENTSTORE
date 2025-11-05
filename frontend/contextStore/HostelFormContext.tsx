import React, { createContext, useState, ReactNode } from "react";
import { useCreatePropertyMutation } from "@/services/api";

// ---------- Types ----------
export interface RentRate {
  type: "daily" | "weekly" | "monthly";
  amount: number;
}

export interface CapacityState {
  beds: number;
  persons: number;
  bedrooms: number;
  bathrooms: number;
}

export interface Description {
  details: string;
  highlights: string[];
}

export interface Address {
  city: string;
  area: string;
  street?: string;
  fullAddress?: string;
  contact?:string
}

export interface HostelFormData {
  _id?: string;
  propertyType?: "hostel";
  subType?: "male" | "female" | "mixed";
  title?: string;
  description?: Description;
  location?: Address;
  capacity?: CapacityState;
  rentRates?: RentRate[];
  securityDeposit?: number | string;
  amenities?: string[];
  safetyFeatures?: string[];
  rules?: string[];
  billsIncluded?: string[];
  photos?: (string | File)[];
  hostOption?: "hostel";
  status?: boolean;
  ownerId?: string;
  views?: number;
}
 
export interface SubmitResult {
  success: boolean;
  data?: any;
  error?: unknown;
}

// ---------- Context ----------
export interface FormContextType {
  data: HostelFormData;
  updateForm: <K extends keyof HostelFormData>(
    step: K,
    values: HostelFormData[K]
  ) => void;
  setFullFormData: (newData: HostelFormData) => void;
  submitData: () => Promise<SubmitResult>;
  submitDraftData: () => Promise<SubmitResult>;
}

export const FormContext = createContext<FormContextType | undefined>(
  undefined
);

// ---------- Provider ----------
export const HostelFormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<HostelFormData>({
    propertyType: "hostel",
    subType: "mixed",
    rentRates: [
      { type: "daily", amount: 0 },
      { type: "weekly", amount: 0 },
      { type: "monthly", amount: 0 },
    ],
    securityDeposit: 0,
    amenities: [],
    safetyFeatures: [],
    rules: [],
    billsIncluded: [],
    photos: [],
    hostOption: "hostel",
  });

  const [createProperty] = useCreatePropertyMutation();

  // ---------- Update specific field ----------
  const updateForm: FormContextType["updateForm"] = (step, values) => {
    setData((prev) => {
      const updated = { ...prev, [step]: values };
      console.log("📝 Updated Hostel Form:", updated);
      return updated;
    });
  };

  // ---------- Load entire form (for draft resume) ----------
  const setFullFormData: FormContextType["setFullFormData"] = (newData) => {
    console.log("📥 Loaded hostel draft data:", newData);
    setData({ ...data, ...newData });
  };

  // ---------- Submit published property ----------
  const submitData: FormContextType["submitData"] = async () => {
    try {
      console.log("🚀 Publishing hostel data:", data);
      const response = await createProperty(data).unwrap();
      console.log("✅ Hostel published:", response);
      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Publish error:", error);
      return { success: false, error };
    }
  };

  // ---------- Save as draft ----------
  const submitDraftData: FormContextType["submitDraftData"] = async () => {
    try {
      console.log("🗂️ Saving hostel draft:", data);
      const response = await createProperty(data).unwrap();
      console.log("✅ Draft saved:", response);
      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Draft save error:", error);
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
