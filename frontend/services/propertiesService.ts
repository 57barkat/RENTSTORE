import {
  useGetFilteredPropertiesQuery,
  useGetUserFavoritesQuery,
  useAddToFavMutation,
  useRemoveUserFavoriteMutation,
} from "@/services/api";

export const useFilteredProperties = (
  filters: any,
  page: number,
  hostOption: string,
) => {
  const { data, isLoading, refetch } = useGetFilteredPropertiesQuery({
    ...filters,
    hostOption,
    page,
    limit: 30,
  });
  return { data, isLoading, refetch };
};
export const useFavorites = (enabled = true) => {
  const { data, refetch } = useGetUserFavoritesQuery(null, {
    skip: !enabled,
  });
  const [addToFav] = useAddToFavMutation();
  const [removeFromFav] = useRemoveUserFavoriteMutation();
  return { data, refetch, addToFav, removeFromFav };
};
