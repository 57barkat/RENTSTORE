export const createUserPayload = (
  values: any,
  role: string | null,
  acceptedTerms: boolean,
) => {
  const safePublicRole = role === "agent" ? "agent" : "user";

  return {
    ...values,
    acceptedTerms,
    role: safePublicRole,
    isAgencyPerson: role === "agency",
  };
};
