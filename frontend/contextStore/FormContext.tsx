import { SafetyDetailsData } from "@/app/upload/SafetyDetailsScreen";
import { BillType } from "@/app/upload/WeekendPricingScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { description } from "@/types/ListingDescriptionHighlightsScreen.types";
import { CapacityState } from "@/types/PropertyDetails.types";
import React, { createContext, useState, ReactNode, useEffect } from "react";

export interface FormData {
  description?: description;
  address?: Address;
  hostOption?: string;
  location?: string;
  capacityState?: CapacityState;
  amenities?: string[];
  photos?: string[];
  title?:string;
  SecuritybasePrice?:number;
  ALL_BILLS?:BillType[];
  monthlyRent?:number;
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

  useEffect(() => {
    console.log("Form Data Updated:", data);
  }, [data]);

  const updateForm: FormContextType["updateForm"] = (step, values) => {
    setData((prev) => {
      const newData = { ...prev, [step]: values };
      console.log("Updated form step:", step, newData);
      return newData;
    });
  };

  return (
    <FormContext.Provider value={{ data, updateForm }}>
      {children}
    </FormContext.Provider>
  );
};
