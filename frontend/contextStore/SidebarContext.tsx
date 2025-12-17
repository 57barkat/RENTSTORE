import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

interface SidebarContextProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  triggerRefresh: () => void;
  refreshFlag: boolean;
  countProperties: number;
  countUploads: number;
  incrementProperties: () => void;
  incrementUploads: () => void;
}

const SidebarContext = createContext<SidebarContextProps | null>(null);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [countProperties, setCountProperties] = useState(0);
  const [countUploads, setCountUploads] = useState(0);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const triggerRefresh = useCallback(() => setRefreshFlag((prev) => !prev), []);
  const incrementProperties = useCallback(
    () => setCountProperties((prev) => prev + 1),
    []
  );
  const incrementUploads = useCallback(
    () => setCountUploads((prev) => prev + 1),
    []
  );

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      triggerRefresh,
      refreshFlag,
      countProperties,
      countUploads,
      incrementProperties,
      incrementUploads,
    }),
    [
      isOpen,
      refreshFlag,
      countProperties,
      countUploads,
      open,
      close,
      toggle,
      triggerRefresh,
      incrementProperties,
      incrementUploads,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be inside SidebarProvider");
  return ctx;
};
