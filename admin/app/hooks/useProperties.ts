import { useState } from "react";
import apiClient from "@/app/lib/api-client";

export const useAdminPropertyDetails = () => {
  // eslint-disable-next-line
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      const { data } = await apiClient.get(`/properties/admin/view/${id}`);
      setSelectedProperty(data);
    } catch (error) {
      alert("Could not load property details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const clearSelectedProperty = () => {
    setSelectedProperty(null);
  };

  return {
    selectedProperty,
    loadingDetails,
    handleViewDetails,
    clearSelectedProperty,
  };
};
