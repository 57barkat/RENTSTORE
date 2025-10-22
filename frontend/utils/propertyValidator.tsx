import { Address } from "@/types/FinalAddressDetailsScreen.types";

export interface AddressErrors {
  [index: number]: Partial<Record<keyof Address, string>>;
}

export const validateAddresses = (
  addresses: Address[]
): {
  valid: boolean;
  errors: AddressErrors;
} => {
  let valid = true;
  const errors: AddressErrors = {};

  addresses.forEach((addr, index) => {
    const fieldErrors: Partial<Record<keyof Address, string>> = {};

    if (!addr.street.trim()) fieldErrors.street = "Street address is required";
    if (!addr.city.trim()) fieldErrors.city = "City is required";
    if (!addr.stateTerritory.trim())
      fieldErrors.stateTerritory = "State/Territory is required";

    if (!addr.zipCode.trim()) {
      fieldErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}$/.test(addr.zipCode.trim())) {
      fieldErrors.zipCode = "ZIP code must be 5 digits";
    }

    if (Object.keys(fieldErrors).length > 0) {
      valid = false;
      errors[index] = fieldErrors;
    }
  });

  return { valid, errors };
};
