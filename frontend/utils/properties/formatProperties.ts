import { PropertyCardProps } from "@/types/TabTypes/TabTypes";

export const formatProperties = (
  data: any[],
  cityFilter: string,
  addressFilter: string,
  callback: () => void,
): PropertyCardProps[] => {
  return data.map((p) => ({
    id: p._id,
    title: p.title,
    city: p.city,
    rent: p.monthlyRent,
    image: p.photos?.[0] || "",
    featured: p.featured,
    isFav: false,
  }));
};
