import React, { createContext, useContext, useState } from "react";

interface SidebarContextProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  triggerRefresh: () => void;
  refreshFlag: boolean;
}

const SidebarContext = createContext<SidebarContextProps | null>(null);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  const triggerRefresh = () => setRefreshFlag((prev) => !prev);
  return (
    <SidebarContext.Provider
      value={{ isOpen, open, close, toggle, triggerRefresh, refreshFlag }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be inside SidebarProvider");
  return ctx;
};
