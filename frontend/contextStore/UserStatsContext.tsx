import React, { createContext, useContext } from "react";
import { useGetUserStatsQuery } from "@/services/api";
import { useAuth } from "@/contextStore/AuthContext";

interface UserStatsContextProps {
  stats: any;
  isLoading: boolean;
  refetch: () => void;
}

const UserStatsContext = createContext<UserStatsContextProps>({
  stats: null,
  isLoading: true,
  refetch: () => {},
});

export const UserStatsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, refetch, isFetching } = useGetUserStatsQuery(null, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  return (
    <UserStatsContext.Provider
      value={{
        stats: data ?? null,
        isLoading: isLoading || isFetching,
        refetch,
      }}
    >
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStats = () => {
  return useContext(UserStatsContext);
};
