"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import apiClient from "@/app/lib/api-client";
import { useAdminPropertyDetails } from "@/app/hooks/useProperties";
import PendingPropertyCard from "@/app/components/admin/PendingPropertyCard";
import PropertyReviewDrawer from "@/app/components/admin/PropertyReviewDrawer";

interface Property {
  _id: string;
  title: string;
  location: string;
  monthlyRent: number;
  ownerId: {
    name: string;
    email: string;
    profileImage?: string;
  };
  photos: string[];
}

export interface PropertyAdminResponse {
  data: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PropertiesScreen({
  initialResponse,
}: {
  initialResponse: PropertyAdminResponse;
}) {
  const [properties, setProperties] = useState<Property[]>(initialResponse.data || []);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(initialResponse.page || 1);
  const [totalPages, setTotalPages] = useState<number>(
    initialResponse.totalPages || 1,
  );
  const itemsPerPage = initialResponse.limit || 6;

  const {
    selectedProperty,
    loadingDetails,
    handleViewDetails,
    clearSelectedProperty,
  } = useAdminPropertyDetails();

  const fetchUnapproved = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        const { data } = await apiClient.get<PropertyAdminResponse>(
          `/properties/admin/unapproved?page=${page}&limit=${itemsPerPage}`,
        );
        setProperties(data?.data || []);
        setTotalPages(data?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch properties", error);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage],
  );

  useEffect(() => {
    if (currentPage === (initialResponse.page || 1)) {
      return;
    }

    fetchUnapproved(currentPage);
  }, [currentPage, fetchUnapproved, initialResponse.page]);

  const handleApprove = async (id: string) => {
    try {
      await apiClient.patch(`/properties/admin/approve/${id}`);
      if (properties.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchUnapproved(currentPage);
      }

      if (selectedProperty?._id === id) {
        clearSelectedProperty();
      }
    } catch (error) {
      alert("Approval failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject and delete this property?")) {
      return;
    }

    try {
      await apiClient.delete(`/properties/admin/delete/${id}`);
      if (properties.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchUnapproved(currentPage);
      }

      if (selectedProperty?._id === id) {
        clearSelectedProperty();
      }
    } catch (error) {
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {selectedProperty && (
        <PropertyReviewDrawer
          property={selectedProperty}
          loading={loadingDetails}
          onClose={clearSelectedProperty}
          onApprove={handleApprove}
          onDelete={handleDelete}
        />
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Approvals</h1>
          <p className="text-sm text-muted-foreground">
            Review newly submitted properties
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-20 text-center">
          <p className="font-medium text-muted-foreground">
            No properties waiting for approval.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PendingPropertyCard
                key={property._id}
                property={property}
                onReview={handleViewDetails}
                onApprove={handleApprove}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="rounded-lg border border-border bg-card p-2 hover:bg-accent disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span>Page {currentPage}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  of
                </span>
                <span>{totalPages}</span>
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="rounded-lg border border-border bg-card p-2 hover:bg-accent disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
