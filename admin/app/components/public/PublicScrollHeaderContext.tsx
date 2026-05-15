"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface PublicScrollHeaderContextValue {
  isHeaderHidden: boolean;
  setIsHeaderHidden: (isHidden: boolean) => void;
}

const PublicScrollHeaderContext =
  createContext<PublicScrollHeaderContextValue | null>(null);

export function PublicScrollHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHeaderHidden, setHeaderHidden] = useState(false);

  const setIsHeaderHidden = useCallback((isHidden: boolean) => {
    setHeaderHidden((current) => (current === isHidden ? current : isHidden));
  }, []);

  const value = useMemo(
    () => ({
      isHeaderHidden,
      setIsHeaderHidden,
    }),
    [isHeaderHidden, setIsHeaderHidden],
  );

  return (
    <PublicScrollHeaderContext.Provider value={value}>
      {children}
    </PublicScrollHeaderContext.Provider>
  );
}

export function usePublicScrollHeader() {
  const context = useContext(PublicScrollHeaderContext);

  if (!context) {
    return {
      isHeaderHidden: false,
      setIsHeaderHidden: () => {},
    };
  }

  return context;
}
