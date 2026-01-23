type ChipKey = "city" | "minRent" | "maxRent" | "beds" | "hostOption";

export const buildSelectedChips = (
  hostOption: string,
  filters: { city?: string; minRent?: number; maxRent?: number; beds?: number },
) => {
  const selectedChips: { key: ChipKey; label: string; removable: boolean }[] = [
    {
      key: "hostOption",
      label: hostOption.charAt(0).toUpperCase() + hostOption.slice(1),
      removable: false,
    },
    ...Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => ({
        key: key as Exclude<ChipKey, "hostOption">, // cast to correct type
        label: `${key}: ${value}`,
        removable: true,
      })),
  ];

  return selectedChips;
};
