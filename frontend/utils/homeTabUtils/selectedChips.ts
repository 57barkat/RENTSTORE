import { ChipKey, Filters } from "./filterUtils";

export const buildSelectedChips = (hostOption: string, filters: Filters) => {
  const selectedChips: { key: ChipKey; label: string; removable: boolean }[] = [
    {
      key: "hostOption",
      label: hostOption.charAt(0).toUpperCase() + hostOption.slice(1),
      removable: false,
    },
    ...Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => ({
        key: key as Exclude<ChipKey, "hostOption">,
        label:
          key === "addressQuery" ? `Address: ${value}` : `${key}: ${value}`,
        removable: true,
      })),
  ];

  return selectedChips;
};
