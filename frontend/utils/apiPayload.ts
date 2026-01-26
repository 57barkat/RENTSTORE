export const createUserPayload = (
  values: any,
  role: string | null,
  acceptedTerms: boolean,
) => ({
  ...values,
  role,
  acceptedTerms,
});
