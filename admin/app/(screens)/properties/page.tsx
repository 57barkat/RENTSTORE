"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Trash2,
  CheckCircle,
  MapPin,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import apiClient from "@/app/lib/api-client";
import PropertyById from "./[id]";
import { useAdminPropertyDetails } from "@/app/hooks/useProperties";

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

const PropertiesAdmin = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    selectedProperty,
    loadingDetails,
    handleViewDetails,
    clearSelectedProperty,
  } = useAdminPropertyDetails();

  const fetchUnapproved = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/properties/admin/unapproved");
      setProperties(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnapproved();
  }, [fetchUnapproved]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return properties.slice(startIndex, startIndex + itemsPerPage);
  }, [properties, currentPage]);

  const totalPages = Math.ceil(properties.length / itemsPerPage);

  const handleApprove = async (id: string) => {
    try {
      await apiClient.patch(`/properties/admin/approve/${id}`);
      setProperties((prev) => {
        const filtered = prev.filter((p) => p._id !== id);
        const newTotalPages = Math.ceil(filtered.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0)
          setCurrentPage(newTotalPages);
        return filtered;
      });
      if (selectedProperty?._id === id) {
        clearSelectedProperty();
      }
    } catch (error) {
      alert("Approval failed");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to reject and delete this property?",
    );
    if (!confirmDelete) return;
    try {
      await apiClient.delete(`/properties/admin/delete/${id}`);
      setProperties((prev) => {
        const filtered = prev.filter((p) => p._id !== id);
        const newTotalPages = Math.ceil(filtered.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0)
          setCurrentPage(newTotalPages);
        return filtered;
      });
      if (selectedProperty?._id === id) {
        clearSelectedProperty();
      }
    } catch (error) {
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {selectedProperty && (
        <PropertyById
          property={selectedProperty}
          loading={loadingDetails}
          onClose={clearSelectedProperty}
          onApprove={handleApprove}
          onDelete={handleDelete}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Pending Approvals
          </h1>
          <p className="text-muted-foreground text-sm">
            Review newly submitted properties
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 bg-card animate-pulse rounded-xl border border-border"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground font-medium">
            No properties waiting for approval. 🎉
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProperties.map((item) => (
              <div
                key={item._id}
                className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 bg-muted overflow-hidden">
                  <img
                    src={
                      item.photos?.[0] ||
                      "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-white text-[9px] font-black rounded uppercase tracking-widest shadow-lg">
                    New Submission
                  </div>
                  <button
                    onClick={() => handleViewDetails(item._id)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <span className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Review Listing
                    </span>
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-foreground truncate text-lg leading-tight">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-muted-foreground text-[11px] font-medium">
                    <MapPin className="w-3 h-3 mr-1 text-primary" />
                    {item.location}
                  </div>
                  <div className="flex items-center justify-between py-3 border-y border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent overflow-hidden border border-border">
                        <img
                          src={item.ownerId?.profileImage}
                          alt="Owner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter leading-none">
                          Owner
                        </p>
                        <p className="text-[11px] font-semibold">
                          {item.ownerId?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter leading-none">
                        Rent
                      </p>
                      <p className="text-sm font-black text-primary">
                        ${item.monthlyRent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all text-xs font-bold border border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(item._id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all text-xs font-bold shadow-md shadow-primary/10"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-lg border border-border bg-card disabled:opacity-50 hover:bg-accent transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Page {currentPage}</span>
                <span className="text-sm text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                  of
                </span>
                <span className="text-sm font-bold">{totalPages}</span>
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-lg border border-border bg-card disabled:opacity-50 hover:bg-accent transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertiesAdmin;
