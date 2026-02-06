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
    limit: 10,
  });
  return { data, isLoading, refetch };
};

export const useFavorites = () => {
  const { data, refetch } = useGetUserFavoritesQuery(null);
  const [addToFav] = useAddToFavMutation();
  const [removeFromFav] = useRemoveUserFavoriteMutation();
  return { data, refetch, addToFav, removeFromFav };
};
