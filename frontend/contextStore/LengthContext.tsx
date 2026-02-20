import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
} from "react";
import { useGetUserFavoritesQuery } from "@/services/api";

interface LengthContextType {
  fav: number;
  setFav: React.Dispatch<React.SetStateAction<number>>;
  upload: number;
  setUpload: React.Dispatch<React.SetStateAction<number>>;
}

const LengthContext = createContext<LengthContextType | null>(null);

export function LengthProvider({ children }: { children: ReactNode }) {
  const [fav, setFav] = useState(0);
  const [upload, setUpload] = useState(0);
  const { data } = useGetUserFavoritesQuery(null);

  useEffect(() => {
    if (Array.isArray(data)) {
      setFav(data.filter((f) => f.property != null).length);
    }
  }, [data]);

  const value = useMemo(
    () => ({ fav, setFav, upload, setUpload }),
    [fav, upload],
  );

  return (
    <LengthContext.Provider value={value}>{children}</LengthContext.Provider>
  );
}

export const useLength = () => {
  const context = useContext(LengthContext);
  if (!context) {
    throw new Error("useLength must be used within LengthProvider");
  }
  return context;
};
