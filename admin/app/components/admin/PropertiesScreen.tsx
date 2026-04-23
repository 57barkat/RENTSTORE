"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Upload } from "lucide-react";

import apiClient from "@/app/lib/api-client";
import { useAdminPropertyDetails } from "@/app/hooks/useProperties";
import PendingPropertyCard from "@/app/components/admin/PendingPropertyCard";
import PropertyReviewDrawer from "@/app/components/admin/PropertyReviewDrawer";
import type { PropertyCategory } from "@/app/lib/property-types";

interface Property {
  _id: string;
  title: string;
  location: string;
  monthlyRent: number;
  hostOption?: PropertyCategory;
  status?: boolean;
  isApproved?: boolean;
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

const CATEGORY_FILTERS: Array<{ label: string; value: PropertyCategory | "all" }> = [
  { label: "All", value: "all" },
  { label: "Homes", value: "home" },
  { label: "Apartments", value: "apartment" },
  { label: "Hostels", value: "hostel" },
  { label: "Shops", value: "shop" },
  { label: "Offices", value: "office" },
];

const APPROVAL_FILTERS: Array<{
  label: string;
  value: "all" | "pending" | "approved";
}> = [
  { label: "All approvals", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
];

const LISTING_FILTERS: Array<{
  label: string;
  value: "all" | "active" | "inactive";
}> = [
  { label: "All visibility", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

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
  const [totalResults, setTotalResults] = useState<number>(initialResponse.total || 0);
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory | "all">("all");
  const [approvalStatus, setApprovalStatus] = useState<"all" | "pending" | "approved">("all");
  const [listingStatus, setListingStatus] = useState<"all" | "active" | "inactive">("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMutation, setActiveMutation] = useState<{
    propertyId: string;
    action: "approve" | "delete";
  } | null>(null);
  const itemsPerPage = initialResponse.limit || 6;

  const {
    selectedProperty,
    loadingDetails,
    handleViewDetails,
    clearSelectedProperty,
  } = useAdminPropertyDetails();

  const fetchProperties = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        const { data } = await apiClient.get<PropertyAdminResponse>("/properties/admin/list", {
          params: {
            page,
            limit: itemsPerPage,
            hostOption: selectedCategory === "all" ? undefined : selectedCategory,
            q: searchQuery || undefined,
            approvalStatus,
            listingStatus,
          },
        });
        setProperties(data?.data || []);
        setTotalResults(data?.total || 0);
        setTotalPages(data?.totalPages || 1);
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [approvalStatus, itemsPerPage, listingStatus, searchQuery, selectedCategory],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [approvalStatus, listingStatus, searchQuery, selectedCategory]);

  useEffect(() => {
    const shouldUseInitialResponse =
      currentPage === (initialResponse.page || 1) &&
      selectedCategory === "all" &&
      approvalStatus === "all" &&
      listingStatus === "all" &&
      !searchQuery;

    if (shouldUseInitialResponse) {
      setProperties(initialResponse.data || []);
      setTotalResults(initialResponse.total || 0);
      setTotalPages(initialResponse.totalPages || 1);
      return;
    }

    void fetchProperties(currentPage);
  }, [
    approvalStatus,
    currentPage,
    fetchProperties,
    initialResponse.data,
    initialResponse.page,
    initialResponse.total,
    initialResponse.totalPages,
    listingStatus,
    searchQuery,
    selectedCategory,
  ]);

  const refreshCurrentPage = useCallback(async () => {
    await fetchProperties(currentPage);
  }, [currentPage, fetchProperties]);

  const activeSummary = useMemo(() => {
    const pendingCount = properties.filter((property) => !property.isApproved).length;
    const activeCount = properties.filter(
      (property) => property.isApproved && property.status,
    ).length;

    return {
      pendingCount,
      activeCount,
    };
  }, [properties]);

  const handleApprove = async (id: string) => {
    setActiveMutation({ propertyId: id, action: "approve" });
    try {
      await apiClient.patch(`/properties/admin/approve/${id}`);
      if (selectedProperty?._id === id) {
        clearSelectedProperty();
      }
      await refreshCurrentPage();
    } catch {
      alert("Approval failed");
    } finally {
      setActiveMutation(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this property?")) {
      return;
    }

    setActiveMutation({ propertyId: id, action: "delete" });
    try {
      await apiClient.delete(`/properties/admin/delete/${id}`);
      if (selectedProperty?._id === id) {
        clearSelectedProperty();
      }
      await refreshCurrentPage();
    } catch {
      alert("Delete failed");
    } finally {
      setActiveMutation(null);
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
          isSubmitting={Boolean(activeMutation)}
          activeAction={activeMutation?.action || null}
        />
      )}

      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Property Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Review submissions, filter by lifecycle state, and manage all five property types.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <Link
            href="/properties/upload"
            className="admin-button-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
          >
            <Upload className="h-4 w-4" />
            Upload Property
          </Link>

          <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Results
            </p>
            <p className="mt-1 text-2xl font-black text-foreground">{totalResults}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Pending on page
            </p>
            <p className="mt-1 text-2xl font-black text-[var(--admin-warning)]">
              {activeSummary.pendingCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Active on page
            </p>
            <p className="mt-1 text-2xl font-black text-primary">
              {activeSummary.activeCount}
            </p>
          </div>
        </div>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title or address..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((filter) => {
            const active = selectedCategory === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedCategory(filter.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {APPROVAL_FILTERS.map((filter) => {
            const active = approvalStatus === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setApprovalStatus(filter.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-[var(--admin-warning)] bg-[var(--admin-warning)] text-white"
                    : "border-border bg-card text-muted-foreground hover:border-[var(--admin-warning)] hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {LISTING_FILTERS.map((filter) => {
            const active = listingStatus === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setListingStatus(filter.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-[var(--admin-secondary)] bg-[var(--admin-secondary)] text-white"
                    : "border-border bg-card text-muted-foreground hover:border-[var(--admin-secondary)] hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
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
            No properties match the current filters.
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
                isProcessing={activeMutation?.propertyId === property._id}
                activeAction={
                  activeMutation?.propertyId === property._id
                    ? activeMutation.action
                    : null
                }
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
