export type RentType = "daily" | "weekly" | "monthly";

type RentLike = {
  defaultRentType?: RentType | null;
  dailyRent?: number | null;
  weeklyRent?: number | null;
  monthlyRent?: number | null;
};

export type PrimaryRentInfo = {
  type: RentType;
  amount: number;
  label: "day" | "week" | "month";
  title: string;
};

const DEFAULT_RENT_TYPE: RentType = "monthly";
const RENT_ORDER: RentType[] = ["monthly", "weekly", "daily"];

const toPositiveRent = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return null;
  }

  return value;
};

const getRentAmount = (property: RentLike, type: RentType) => {
  if (type === "daily") {
    return toPositiveRent(property.dailyRent);
  }

  if (type === "weekly") {
    return toPositiveRent(property.weeklyRent);
  }

  return toPositiveRent(property.monthlyRent);
};

export const getDefaultRentType = (value?: string | null): RentType => {
  if (value === "daily" || value === "weekly" || value === "monthly") {
    return value;
  }

  return DEFAULT_RENT_TYPE;
};

export const getRentDisplayOrder = (property: RentLike): RentType[] => {
  const preferredType = getDefaultRentType(property.defaultRentType);
  return [preferredType, ...RENT_ORDER.filter((type) => type !== preferredType)];
};

export const getPrimaryRentInfo = (
  property: RentLike,
): PrimaryRentInfo | null => {
  for (const type of getRentDisplayOrder(property)) {
    const amount = getRentAmount(property, type);

    if (!amount) {
      continue;
    }

    if (type === "daily") {
      return {
        type,
        amount,
        label: "day",
        title: "Daily rate",
      };
    }

    if (type === "weekly") {
      return {
        type,
        amount,
        label: "week",
        title: "Weekly rent",
      };
    }

    return {
      type,
      amount,
      label: "month",
      title: "Monthly rent",
    };
  }

  return null;
};
