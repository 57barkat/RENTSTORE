import { getPrimaryRentInfo } from "./rent";

export const formatProperties = (data: any[], city: string) => {
  return data.map((item) => ({
    ...(getPrimaryRentInfo(item)
      ? {
          rent: getPrimaryRentInfo(item)!.amount,
        }
      : {}),
    id: item._id || item.id,
    _id: item._id,
    title: item.title,
    city: item.address?.[0]?.city || city,
    location: item.area || item.address?.[0]?.street || "Islamabad",
    defaultRentType: item.defaultRentType,
    dailyRent: item.dailyRent,
    weeklyRent: item.weeklyRent,
    monthlyRent: item.monthlyRent,
    image: item.photos?.[0] || item.image,
    photos: item.photos || [],
    sortWeight: item.sortWeight,
    featured: item.featured,
    isBoosted: item.sortWeight === 2,
  }));
};
export const formatPhoneForWhatsApp = (phone: any) => {
  let cleaned = phone.replace(/\D/g, ""); // remove spaces, +, etc.

  // Convert Pakistani local format to international
  if (cleaned.startsWith("0")) {
    cleaned = "92" + cleaned.substring(1);
  }

  return cleaned;
};
export const getPriceDisplay = (item: any) => {
  const primaryRent = getPrimaryRentInfo(item);

  if (!primaryRent) {
    return null;
  }

  return { val: primaryRent.amount, label: primaryRent.label };
};
