import { pakistaniCities } from "../cities";

export const filterCities = (query: string): string[] => {
  if (!query) return [];
  return pakistaniCities.filter((city) =>
    city.toLowerCase().includes(query.toLowerCase())
  );
};
