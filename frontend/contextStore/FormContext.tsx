import { SafetyDetailsData } from "@/app/upload/SafetyDetailsScreen";
import { BillType } from "@/app/upload/WeekendPricingScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { Description } from "@/types/ListingDescriptionHighlightsScreen.types";
import { CapacityState } from "@/types/PropertyDetails.types";
import React, { createContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
}

export const FormContext = createContext<FormContextType | undefined>(
  undefined
);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FormData>({});

  // useEffect(() => {
  //   console.log("Component was mounted or re-rendered"); // This will run on mount
  //   return () => {
  //     console.log("COmponent was unmounted")
  //     setData({}); // REACT ANTI PATTERN / CONFLICT 
  //   };
  // }, []);

  const updateForm: FormContextType["updateForm"] = async (step, values) => {
    setData((prev) => {
      const newData = { ...prev, [step]: values };
      console.log(newData)
      return newData;
    });
  };

  return (
    <FormContext.Provider value={{ data, updateForm }}>
      {children}
    </FormContext.Provider>
  );
};
