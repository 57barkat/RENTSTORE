import { useGetAllPropertiesQuery } from "@/services/api";

export const useHomes = (page = 1, limit = 10) => {
  const result = useGetAllPropertiesQuery({
    page,
    limit,
    hostOption: "home",
  });
  return { ...result, data: result.data?.data ?? [] };
};

export const useApartments = (page = 1, limit = 10) => {
  const result = useGetAllPropertiesQuery({
    page,
    limit,
    hostOption: "apartment",
  });
  return { ...result, data: result.data?.data ?? [] };
};

export const useRooms = (page = 1, limit = 10) => {
  const result = useGetAllPropertiesQuery({
    page,
    limit,
    hostOption: "hostel",
  });
  return { ...result, data: result.data?.data ?? [] };
};
