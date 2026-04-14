/* eslint-disable */
import React from "react";
import Link from "next/link";
import { Bed, Bath, CheckCircle2, MapPin, Star } from "lucide-react";

export default function PropertyCard({ data }: { data: any }) {
  const city = data.address?.[0]?.city || "Islamabad";
  const area = data.area || "N/A";

  // 1. DYNAMIC CATEGORY: Determine if it's a hostel, apartment, or home
  // This matches your new folder structure /[category]/[city]/[location]/[id]
  const category = (
    data.hostOption ||
    data.propertyType ||
    "home"
  ).toLowerCase();

  const locationSlug = encodeURIComponent(data.location || "area");

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-300/40 transition-all duration-500 flex flex-col h-full border-b-4 border-b-transparent hover:border-b-blue-500">
      <div className="relative aspect-[16/11] overflow-hidden">
        <img
          src={
            data.photos?.[0] ||
            "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt={data.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
        />

        {/* Type Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-xl border border-white">
            {data.hostelType || data.propertyType || "Property"}
          </div>
        </div>

        {/* Status Badge */}
        {(data.sortWeight === 3 || data.isBoosted) && (
          <div className="absolute top-4 right-4 bg-amber-400 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1">
            <Star size={10} fill="currentColor" /> FEATURED
          </div>
        )}

        <div className="absolute bottom-4 left-4">
          <span className="bg-gray-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold">
            Floor {data.floorLevel || 0}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow space-y-2">
          <h3 className="font-extrabold text-xl text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {data.title}
          </h3>
          <p className="text-sm text-gray-500 font-semibold flex items-center gap-1">
            <MapPin size={14} className="text-red-400" /> {area}, {city}
          </p>
        </div>

        <div className="flex items-center justify-between py-4 my-4 border-y border-gray-50">
          <div className="flex flex-col items-center">
            <Bed size={18} className="text-blue-500 mb-1" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              {data.capacityState?.beds || 0} Beds
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-gray-100 px-6">
            <Bath size={18} className="text-blue-500 mb-1" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              {data.capacityState?.bathrooms || 0} Bath
            </span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle2 size={18} className="text-green-500 mb-1" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              Bills Incl.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-sm text-gray-400 font-bold block -mb-1">
              Monthly
            </span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              Rs {data.monthlyRent?.toLocaleString()}
            </span>
          </div>

          {/* 2. UPDATED LINK: Uses the dynamic category instead of hardcoded /home/ */}
          <Link
            href={`/${category}/${city.toLowerCase()}/${locationSlug}/${data._id}`}
            className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-gray-900 transition-all shadow-lg shadow-blue-200"
          >
            <ChevronRight size={20} strokeWidth={3} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, strokeWidth }: any) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
