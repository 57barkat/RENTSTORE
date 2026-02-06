export const formatPrice = (
  amount: number | string | undefined,
  cat: string,
) => {
  if (amount === undefined || amount === null) return ` ${cat}`;
  const num = typeof amount === "string" ? parseInt(amount, 10) : amount;
  return `Rs. ${num.toLocaleString()}`;
};
