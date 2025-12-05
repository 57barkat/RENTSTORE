import { PropertyItem, PropertyCardProps } from "@/types/TabTypes/TabTypes";

export const formatProperties = (
  items: PropertyItem[] = [],
  cityFilter: string = "",
  loadingFavId: string | null = null,
  onFavPress?: (id: string, isFav?: boolean) => void,
  highlightCity: string = ""
): PropertyCardProps[] => {
  if (!Array.isArray(items)) return [];

  let filtered = [...items];
  if (cityFilter) {
    filtered = filtered.filter((item) => {
      const city = item.address?.[0]?.city;
      return city
        ? city.toLowerCase().includes(cityFilter.toLowerCase())
        : false;
    });
  }

  const sorted = filtered.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  return sorted.map((item) => ({
    id: item._id,
    title: item.title,
    city: item.address?.[0]?.city,
    country: item.address?.[0]?.country ?? "Pakistan",
    rent: item.monthlyRent,
    image: item.photos?.[0],
    featured: item.featured,
    isFav: item.isFav,
    onFavPress,
    loadingFav: loadingFavId === item._id,
    highlightCity,
  }));
};
