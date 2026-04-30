import { useCallback, useState } from "react";
import apiClient from "@/app/lib/api-client";

export const useAdminPropertyDetails = () => {
  // eslint-disable-next-line
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadPropertyDetails = useCallback(async (id: string) => {
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
  }, []);

  const handleViewDetails = useCallback(
    async (id: string) => {
      await loadPropertyDetails(id);
    },
    [loadPropertyDetails],
  );

  const refreshSelectedProperty = useCallback(async () => {
    if (!selectedProperty?._id) {
      return;
    }

    await loadPropertyDetails(selectedProperty._id);
  }, [loadPropertyDetails, selectedProperty?._id]);

  const clearSelectedProperty = () => {
    setSelectedProperty(null);
  };

  return {
    selectedProperty,
    loadingDetails,
    handleViewDetails,
    refreshSelectedProperty,
    clearSelectedProperty,
  };
};
