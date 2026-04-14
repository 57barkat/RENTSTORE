/* eslint-disable */
import React from "react";
import apiClient from "@/app/lib/api-client";
import Filters from "@/app/components/Filters";
import PropertyCard from "@/app/components/PropertyCard";
import { SortBar } from "@/app/components/SortBar";
import { Pagination } from "@/app/components/Pagination";
import { Search } from "lucide-react";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ params, searchParams }: PageProps) {
  console.log("Received params:", await params);
  console.log("Received searchParams:", await searchParams);
  let properties = [];
  let totalPages = 1;

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const category = resolvedParams.category;

  const city = (resolvedSearchParams.city as string) || "Islamabad";
  const maxPrice = (resolvedSearchParams.maxPrice as string) || "";
  const minRent = (resolvedSearchParams.minRent as string) || "0";

  const hostOption =
    (resolvedSearchParams.hostOption as string) || category || "home";

  const hostelType = (resolvedSearchParams.hostelType as string) || "";
  const floorLevel = (resolvedSearchParams.floorLevel as string) || "";
  const amenities = (resolvedSearchParams.amenities as string) || "";
  const page = (resolvedSearchParams.page as string) || "1";
  const sortBy = (resolvedSearchParams.sortBy as string) || "newest";
  const addressQuery = (resolvedSearchParams.addressQuery as string) || "";

  try {
    const queryParts = [
      `city=${city}`,
      `maxPrice=${maxPrice}`,
      `minRent=${minRent}`,
      `hostOption=${hostOption}`,
      `hostelType=${hostelType}`,
      `page=${page}`,
      `sortBy=${sortBy}`,
      `priceType=monthly`,
    ];

    if (floorLevel) queryParts.push(`floorLevel=${floorLevel}`);
    if (amenities) queryParts.push(`amenities=${amenities}`);
    if (addressQuery)
      queryParts.push(`addressQuery=${encodeURIComponent(addressQuery)}`);

    const response = await apiClient.get(
      `properties/search?${queryParts.join("&")}`,
    );
    properties = response.data.data || [];
    totalPages = response.data.totalPages || 1;
  } catch (error) {
    console.error("API Error in Home:", error);
  }

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <main className="max-w-[1400px] mx-auto p-4 lg:p-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-1 bg-blue-600 rounded-full" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Explore {category}s
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight capitalize">
              {hostOption === "hostel"
                ? "Premium Hostels"
                : `Modern ${category}s`}{" "}
              in <span className="text-blue-600">{city}</span>
            </h1>
          </div>
          <SortBar />
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-80 shrink-0">
            <Filters />
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {properties.length > 0 ? (
                properties.map((item: any) => (
                  <PropertyCard key={item._id} data={item} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-white rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-gray-300" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    No matches found
                  </h3>
                  <p className="text-gray-400 mt-2 max-w-xs mx-auto">
                    Try adjusting your filters for {category}s in {city}.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-12">
              <Pagination
                currentPage={parseInt(page)}
                totalPages={totalPages}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
