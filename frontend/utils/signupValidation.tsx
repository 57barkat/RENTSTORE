import * as Yup from "yup";

// Validation schema factory based on role
export function signupValidationSchema(role?: string | null) {
  return Yup.object().shape({
    name: Yup.string().required("Full Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    phone: Yup.string()
      .required("Phone is required")
      .min(10, "Phone must be at least 10 characters"),
    cnic: Yup.string()
      .min(13, "CNIC must be at least 13 characters")
      .required("CNIC is required"),
    agencyName:
      role === "agency"
        ? Yup.string().required("Agency Name is required")
        : Yup.string(),
    agencyLicense:
      role === "agency"
        ? Yup.string().required("Agency License is required")
        : Yup.string(),
  });
}
