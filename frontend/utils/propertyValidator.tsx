import * as Yup from "yup";

// Pakistani phone regex: starts with 03, 11 digits
const pakPhoneRegex = /^03\d{9}$/;

export const propertyValidationSchema = Yup.object().shape({
  propertyType: Yup.string()
    .required("Property type is required"),
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(20, "Description must be at least 20 characters")
    .required("Description is required"),
  address: Yup.string()
    .required("Address is required"),
  city: Yup.string()
    .required("City is required"),
  latitude: Yup.number()
    .typeError("Latitude is required")
    .required("Latitude is required"),
  longitude: Yup.number()
    .typeError("Longitude is required")
    .required("Longitude is required"),
  area: Yup.string()
    .required("Area is required"),
  rentPrice: Yup.number()
    .typeError("Rent price must be a number")
    .moreThan(0, "Rent price must be greater than 0")
    .required("Rent price is required"),
  securityDeposit: Yup.number()
    .typeError("Deposit must be a number")
    .min(0, "Deposit must be at least 0")
    .required("Deposit is required"),
  ownerName: Yup.string()
    .required("Owner name is required"),
  phone: Yup.string()
    .matches(pakPhoneRegex, "Phone must be a valid Pakistani number")
    .required("Phone is required"),
  bedrooms: Yup.number()
    .integer("Bedrooms must be an integer")
    .min(0, "Bedrooms cannot be negative")
    .nullable(),
  bathrooms: Yup.number()
    .integer("Bathrooms must be an integer")
    .min(0, "Bathrooms cannot be negative")
    .nullable(),
  kitchens: Yup.number()
    .integer("Kitchens must be an integer")
    .min(0, "Kitchens cannot be negative")
    .nullable(),
  livingRooms: Yup.number()
    .integer("Living rooms must be an integer")
    .min(0, "Living rooms cannot be negative")
    .nullable(),
  balconies: Yup.number()
    .integer("Balconies must be an integer")
    .min(0, "Balconies cannot be negative")
    .nullable(),
  furnished: Yup.boolean(),
  floor: Yup.number()
    .integer("Floor must be an integer")
    .nullable(),
  maintenanceCharges: Yup.number()
    .typeError("Maintenance must be a number")
    .nullable(),
  utilitiesIncluded: Yup.boolean(),
  email: Yup.string()
    .email("Invalid email")
    .nullable(),
  images: Yup.array()
    .of(Yup.object())
    .min(1, "At least one photo is required"),
  videos: Yup.array()
    .of(Yup.object())
    .nullable(),
  amenities: Yup.array()
    .of(Yup.string()),
  preferences: Yup.string()
    .nullable(),
  petsAllowed: Yup.boolean(),
});

