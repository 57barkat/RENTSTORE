import { useFindPropertyByIdQuery } from "@/services/api";

export const usePropertyById = (id: string) => {
  const { data, isLoading, refetch, isFetching } = useFindPropertyByIdQuery(id);
  return { property: data, isLoading, refetch, isFetching };
};
