"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import publicApiClient from "@/app/lib/public-api-client";

interface ReportedPropertiesContextValue {
  hiddenPropertyIds: Set<string>;
  hideProperty: (propertyId: string) => void;
  unhideProperty: (propertyId: string) => void;
  isPropertyHidden: (propertyId: string) => boolean;
}

const ReportedPropertiesContext =
  createContext<ReportedPropertiesContextValue | null>(null);
const EMPTY_HIDDEN_PROPERTY_IDS = new Set<string>();

export default function ReportedPropertiesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = usePublicAuth();
  const [loadedHiddenPropertyIds, setLoadedHiddenPropertyIds] = useState<Set<string>>(
    () => new Set(),
  );
  const hiddenPropertyIds = isAuthenticated
    ? loadedHiddenPropertyIds
    : EMPTY_HIDDEN_PROPERTY_IDS;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    const loadHiddenProperties = async () => {
      try {
        const response = await publicApiClient.get<{
          propertyIds?: string[];
        }>("/reports/my-hidden-properties");

        if (!cancelled) {
          setLoadedHiddenPropertyIds(new Set(response.data.propertyIds || []));
        }
      } catch {
        if (!cancelled) {
          setLoadedHiddenPropertyIds(new Set());
        }
      }
    };

    void loadHiddenProperties();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, user?.id]);

  const hideProperty = useCallback((propertyId: string) => {
    setLoadedHiddenPropertyIds((current) => {
      const next = new Set(current);
      next.add(propertyId);
      return next;
    });
  }, []);

  const unhideProperty = useCallback((propertyId: string) => {
    setLoadedHiddenPropertyIds((current) => {
      const next = new Set(current);
      next.delete(propertyId);
      return next;
    });
  }, []);

  const isPropertyHidden = useCallback(
    (propertyId: string) => hiddenPropertyIds.has(propertyId),
    [hiddenPropertyIds],
  );

  const value = useMemo<ReportedPropertiesContextValue>(
    () => ({
      hiddenPropertyIds,
      hideProperty,
      unhideProperty,
      isPropertyHidden,
    }),
    [hiddenPropertyIds, hideProperty, isPropertyHidden, unhideProperty],
  );

  return (
    <ReportedPropertiesContext.Provider value={value}>
      {children}
    </ReportedPropertiesContext.Provider>
  );
}

export const useReportedProperties = () => {
  const context = useContext(ReportedPropertiesContext);

  if (!context) {
    throw new Error(
      "useReportedProperties must be used inside ReportedPropertiesProvider.",
    );
  }

  return context;
};
