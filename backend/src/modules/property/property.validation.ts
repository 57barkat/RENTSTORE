import { CreatePropertyDto } from "./dto/create-property.dto";
import { PropertyHostOption } from "./property.constants";

type FieldErrors = Record<string, string>;

const hasText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasPositiveNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const hasNonNegativeNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const hasArrayValues = (value: unknown) =>
  Array.isArray(value) && value.length > 0;

const hasValidAddress = (address?: CreatePropertyDto["address"]) => {
  const firstAddress = Array.isArray(address) ? address[0] : undefined;

  if (!firstAddress) {
    return false;
  }

  return (
    hasText(firstAddress.street) &&
    hasText(firstAddress.city) &&
    hasText(firstAddress.stateTerritory) &&
    hasText(firstAddress.zipCode)
  );
};

const hasAtLeastOneRent = (dto: Partial<CreatePropertyDto>) =>
  hasPositiveNumber(dto.dailyRent) ||
  hasPositiveNumber(dto.weeklyRent) ||
  hasPositiveNumber(dto.monthlyRent);

const addError = (errors: FieldErrors, field: string, message: string) => {
  if (!errors[field]) {
    errors[field] = message;
  }
};

export const validatePropertyPayload = (
  dto: Partial<CreatePropertyDto>,
): { valid: boolean; fieldErrors: FieldErrors } => {
  const errors: FieldErrors = {};
  const hostOption = dto.hostOption as PropertyHostOption | undefined;

  if (!hostOption) {
    addError(errors, "hostOption", "Property type is required.");
  }

  if (!hasText(dto.title)) {
    addError(errors, "title", "Listing title is required.");
  }

  if (!hasText(dto.location)) {
    addError(errors, "location", "Property location is required.");
  }

  if (!hasPositiveNumber(dto.lat) || !hasPositiveNumber(dto.lng)) {
    addError(errors, "coordinates", "A valid map location is required.");
  }

  if (!hasValidAddress(dto.address)) {
    addError(
      errors,
      "address",
      "Street, city, state/territory, and ZIP code are required.",
    );
  }

  if (!hasArrayValues(dto.photos)) {
    addError(errors, "photos", "At least one property photo is required.");
  }

  if (!hasArrayValues(dto.amenities)) {
    addError(errors, "amenities", "Select at least one amenity.");
  }

  if (!hasArrayValues(dto.description?.highlighted)) {
    addError(
      errors,
      "description.highlighted",
      "Select at least one listing highlight.",
    );
  }

  if (!hasNonNegativeNumber(dto.SecuritybasePrice)) {
    addError(
      errors,
      "SecuritybasePrice",
      "Security deposit must be provided.",
    );
  }

  if (!hasAtLeastOneRent(dto)) {
    addError(
      errors,
      "pricing",
      "Provide at least one valid daily, weekly, or monthly rent.",
    );
  }

  if (!hasArrayValues(dto.safetyDetailsData?.safetyDetails)) {
    addError(
      errors,
      "safetyDetailsData.safetyDetails",
      "Select at least one safety detail.",
    );
  }

  if (
    dto.safetyDetailsData?.safetyDetails?.includes("exterior_camera") &&
    !hasText(dto.safetyDetailsData.cameraDescription || "")
  ) {
    addError(
      errors,
      "safetyDetailsData.cameraDescription",
      "Exterior camera details must be disclosed.",
    );
  }

  if (hostOption === "hostel") {
    if (!dto.hostelType) {
      addError(errors, "hostelType", "Hostel type is required.");
    }

    if (!hasArrayValues(dto.mealPlan)) {
      addError(errors, "mealPlan", "Select at least one meal plan.");
    }

    if (!hasArrayValues(dto.rules)) {
      addError(errors, "rules", "Select at least one hostel rule.");
    }

    if (!hasPositiveNumber(dto.capacityState?.Persons)) {
      addError(
        errors,
        "capacityState.Persons",
        "Guest capacity must be at least 1.",
      );
    }

    if (!hasPositiveNumber(dto.capacityState?.beds)) {
      addError(errors, "capacityState.beds", "Bed count must be at least 1.");
    }
  }

  if (hostOption === "apartment") {
    if (!dto.apartmentType) {
      addError(errors, "apartmentType", "Apartment type is required.");
    }

    if (!dto.furnishing) {
      addError(errors, "furnishing", "Furnishing status is required.");
    }

    if (!hasPositiveNumber(dto.capacityState?.bedrooms)) {
      addError(
        errors,
        "capacityState.bedrooms",
        "Bedroom count must be at least 1.",
      );
    }

    if (!hasPositiveNumber(dto.capacityState?.bathrooms)) {
      addError(
        errors,
        "capacityState.bathrooms",
        "Bathroom count must be at least 1.",
      );
    }
  }

  if (hostOption === "home" || hostOption === "shop" || hostOption === "office") {
    if (!hasPositiveNumber(dto.size?.value)) {
      addError(errors, "size.value", "Property size must be greater than 0.");
    }

    if (!hasText(dto.size?.unit)) {
      addError(errors, "size.unit", "Property size unit is required.");
    }

    if (!hasPositiveNumber(dto.capacityState?.bedrooms)) {
      addError(
        errors,
        "capacityState.bedrooms",
        hostOption === "home"
          ? "Bedroom count must be at least 1."
          : "Room count must be at least 1.",
      );
    }

    if (!hasPositiveNumber(dto.capacityState?.bathrooms)) {
      addError(
        errors,
        "capacityState.bathrooms",
        "Bathroom count must be at least 1.",
      );
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    fieldErrors: errors,
  };
};
