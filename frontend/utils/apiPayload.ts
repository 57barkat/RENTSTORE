export const createUserPayload = (
  values: any,
  role: string | null,
  acceptedTerms: boolean,
) => ({
  ...values,
  acceptedTerms,
  isAgencyPerson: role === "agency",
});
