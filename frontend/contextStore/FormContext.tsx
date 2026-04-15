import { SafetyDetailsData } from "@/app/upload/SafetyDetailsScreen";
import { BillType } from "@/app/upload/WeekendPricingScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { Description } from "@/types/ListingDescriptionHighlightsScreen.types";
import { CapacityState } from "@/types/PropertyDetails.types";
import React, { createContext, useState, ReactNode } from "react";
import { useCreatePropertyMutation } from "@/services/api";
import { useAuth } from "./AuthContext";
import Constants from "expo-constants";

const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET =
  Constants.expoConfig?.extra?.UPLOAD_PRESET || process.env.UPLOAD_PRESET;
// --- Cloudinary Config ---
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const MAX_PARALLEL_UPLOADS = 3;
// const UPLOAD_PRESET = "property_upload";

/**
 * Helper to upload a single file to Cloudinary directly from the device
 */
const uploadToCloudinary = async (fileUri: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    type: "image/jpeg",
    name: "property_image.jpg",
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Cloudinary Upload Failed");
  }

  const result = await response.json();
  return result.secure_url;
};

const mapWithConcurrency = async <T, R,>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex++;
        results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      }
    }),
  );

  return results;
};

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
  const { updateUser } = useAuth();

  const updateForm: FormContextType["updateForm"] = (step, values) => {
    setData((prev) => ({ ...prev, [step]: values }));
  };

  const setFullFormData: FormContextType["setFullFormData"] = (newData) => {
    setData({ ...newData });
  };

  /**
   * Main Submission Logic
   */
  const submitData: FormContextType["submitData"] = async (overrideData) => {
    try {
      const sourceData = overrideData ?? data;
      // Deep copy to avoid mutating the UI state during upload
      const payload = JSON.parse(JSON.stringify(sourceData));

      // 1. Check if we need to upload photos
      if (payload.photos && payload.photos.length > 0) {
        console.log(
          `Starting Cloudinary uploads with concurrency ${MAX_PARALLEL_UPLOADS}...`,
        );

        payload.photos = await mapWithConcurrency(
          payload.photos,
          MAX_PARALLEL_UPLOADS,
          async (uri: string) => {
            if (uri.startsWith("http")) return uri;
            return uploadToCloudinary(uri);
          },
        );
        console.log("Uploads complete. Photos ready as URLs.");
      }

      // 2. Send the cleaned JSON payload to your backend
      // This will now be near-instant because it's just text
      console.log("Submitting property payload to backend...");
      const response = await createProperty(payload).unwrap();

      if (response.user) {
        await updateUser(response.user);
      }

      return { success: true, data: response };
    } catch (error) {
      console.error("Submission failed:", error);
      return { success: false, error };
    }
  };

  const submitDraftData: FormContextType["submitDraftData"] = async (
    overrideData,
  ) => {
    try {
      // For drafts, we can just save the local URIs or upload them
      // (Better to upload so the draft has images)
      return await submitData(overrideData);
    } catch (error) {
      console.error("Draft save failed:", error);
      return { success: false, error };
    }
  };

  const clearForm = () => setData({});

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
