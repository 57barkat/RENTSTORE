const GUEST_SERVICE_FEE_RATE = 0.15; // Example 15% fee
export const calculatePrices = (
  weekdayPrice: number,
  premiumPercent: number
) => {
  const weekendBasePrice = Math.round(
    weekdayPrice * (1 + premiumPercent / 100)
  );
  const personserviceFee = Math.round(weekendBasePrice * GUEST_SERVICE_FEE_RATE);
  const guestPriceBeforeTaxes = weekendBasePrice + personserviceFee;
  const hostEarns = weekendBasePrice - Math.round(weekendBasePrice * 0.03); // Example: 3% host service fee

  return {
    weekendBasePrice,
    personserviceFee,
    guestPriceBeforeTaxes,
    hostEarns,
  };
};
