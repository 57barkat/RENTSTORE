import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
} from "react";

import { useAuth } from "@/contextStore/AuthContext";
import { useGetUserFavoritesQuery } from "@/services/api";
import { useGetRoomsQuery } from "@/hooks/chat";

// You can type this properly if you already have ChatRoom interface
interface ChatRoom {
  _id: string;
  unreadCount?: number;
}

interface LengthContextType {
  fav: number;
  upload: number;
  unread: number;

  setFav: React.Dispatch<React.SetStateAction<number>>;
  setUpload: React.Dispatch<React.SetStateAction<number>>;
  setUnread: React.Dispatch<React.SetStateAction<number>>;
}

const LengthContext = createContext<LengthContextType | null>(null);

export function LengthProvider({ children }: { children: ReactNode }) {
  const [fav, setFav] = useState(0);
  const [upload, setUpload] = useState(0);
  const [unread, setUnread] = useState(0);
  const { isAuthenticated } = useAuth();

  const { data: favorites } = useGetUserFavoritesQuery(null, {
    skip: !isAuthenticated,
  });

  const { data: rooms } = useGetRoomsQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (Array.isArray(favorites)) {
      const validFavorites = favorites.filter((f) => f.property != null);
      setFav(validFavorites.length);
    } else if (!isAuthenticated) {
      setFav(0);
    }
  }, [favorites, isAuthenticated]);

  useEffect(() => {
    if (Array.isArray(rooms)) {
      const totalUnread = rooms.reduce(
        (sum: number, room: ChatRoom) => sum + (room.unreadCount || 0),
        0,
      );

      setUnread(totalUnread);
    } else if (!isAuthenticated) {
      setUnread(0);
    }
  }, [rooms, isAuthenticated]);

  const value = useMemo(
    () => ({
      fav,
      upload,
      unread,
      setFav,
      setUpload,
      setUnread,
    }),
    [fav, upload, unread],
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
