import { useState } from "react";
import apiClient from "@/app/lib/api-client";

export const useAdminPropertyDetails = () => {
  // eslint-disable-next-line
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      const [propertyResponse, uploaderSummaryResponse] = await Promise.all([
        apiClient.get(`/properties/admin/view/${id}`),
        apiClient.get(`/properties/${id}/uploader-summary`),
      ]);
      setSelectedProperty({
        ...propertyResponse.data,
        uploaderSummary: uploaderSummaryResponse.data,
      });
    } catch {
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
