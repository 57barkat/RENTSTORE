/* eslint-disable   */
import React from "react";
import apiClient from "@/app/lib/api-client";
import {
  ShieldCheck,
  MapPin,
  CheckCircle,
  Zap,
  Info,
  PhoneCall,
} from "lucide-react";

interface Property {
  id: string;
  title: string | { value: string };
  hostelType?: string;
  propertyType?: string;
  isBoosted?: boolean;
  area: string | { value: string };
  address?: [{ city: string }];
  description: string | { value: string };
  photos: string[];
  amenities: any[];
  safetyDetailsData?: {
    cameraDescription?: string;
    safetyDetails?: string[];
  };
  monthlyRent: number;
  SecuritybasePrice?: number;
}

interface PageProps {
  params: Promise<{ city: string; location: string; id: string }>;
}

export default async function PropertyDetails({ params }: PageProps) {
  const { id } = await params;
  let p: Property | null = null;

  try {
    const res = await apiClient.get(`/properties/${id}`);
    p = res.data.data || res.data;
  } catch (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-4">
          <Info className="text-red-500" size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Property unavailable
        </h2>
        <p className="text-gray-500 mt-2">
          The listing might have been removed or the ID is incorrect.
        </p>
      </div>
    );
  }

  if (!p) return null;

  const renderText = (val: any): string => {
    if (!val) return "";
    if (typeof val === "object") {
      return val.value || val.name || val.highlighted || JSON.stringify(val);
    }
    return String(val);
  };

  const propertyImages =
    p.photos?.length > 0 ? p.photos : ["/placeholder-property.jpg"];

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-12">
      {/* Dynamic Gallery: Full width on mobile, Grid on Desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-4 lg:grid-rows-2 gap-3 md:gap-4 h-auto lg:h-[600px] rounded-3xl lg:rounded-[2.5rem] overflow-hidden mb-8 md:mb-12 shadow-2xl shadow-gray-200">
        <div className="col-span-4 lg:col-span-2 lg:row-span-2 relative aspect-[4/3] lg:aspect-auto group">
          <img
            src={propertyImages[0]}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Main Property View"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Desktop-only secondary images */}
        <div className="hidden lg:contents">
          {propertyImages.slice(1, 4).map((photo, idx) => (
            <div
              key={`photo-${idx}`}
              className={`relative group ${idx === 2 ? "col-span-2" : "col-span-1"}`}
            >
              <img
                src={photo}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={`View ${idx + 2}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
          <section>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {renderText(p.hostelType || p.propertyType || "Property")}
              </span>
              {p.isBoosted && (
                <span className="bg-amber-400 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Featured Property
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-[1.1]">
              {renderText(p.title)}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 font-bold mt-4 bg-gray-100 w-fit px-4 py-2 rounded-xl text-sm">
              <MapPin size={18} className="text-blue-500" />
              {renderText(p.area)}, {p.address?.[0]?.city || "Islamabad"}
            </div>
          </section>

          {/* Description */}
          <section className="space-y-4">
            <h3 className="text-xl font-black text-gray-900">
              About this place
            </h3>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              {renderText(p.description) ||
                "Welcome to this premium property located in a prime area."}
            </p>
          </section>

          {/* Amenities: Responsive columns */}
          <section>
            <h3 className="text-xl font-black text-gray-900 mb-6">
              What this place offers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {p.amenities?.map((amenity, index) => (
                <div
                  key={`amenity-${index}`}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle className="text-blue-500" size={16} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">
                    {renderText(amenity)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Safety Card */}
          <section className="bg-gray-900 p-6 md:p-10 rounded-3xl md:rounded-[3rem] text-white flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
            <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30 shrink-0">
              <ShieldCheck size={40} className="text-blue-400" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-black">
                Safety & Verification
              </h3>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed max-w-lg">
                {renderText(p.safetyDetailsData?.cameraDescription) ||
                  "This property has been manually verified by our team for your peace of mind."}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-6">
                {(
                  p.safetyDetailsData?.safetyDetails || [
                    "Verified Listing",
                    "Secure",
                  ]
                ).map((item, index) => (
                  <span
                    key={`safety-${index}`}
                    className="bg-gray-800/50 border border-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-bold text-blue-300"
                  >
                    {renderText(item)}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Price Card: Flow on mobile, Sticky on desktop */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-gray-100 shadow-xl rounded-[2rem] p-6 md:p-10">
              <div className="flex flex-col gap-1 mb-6">
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  Monthly Rent
                </span>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">
                    Rs {Number(p.monthlyRent).toLocaleString()}
                  </h2>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold text-xs">
                    Security Deposit
                  </span>
                  <span className="font-black text-gray-900 text-sm">
                    Rs {Number(p.SecuritybasePrice || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-green-50/50 p-4 rounded-xl border border-green-100">
                  <span className="text-green-700 font-bold text-xs flex items-center gap-2">
                    <Zap size={14} /> Bills Included
                  </span>
                  <span className="text-green-700 font-black text-xs">YES</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-gray-900 text-white py-4 md:py-5 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 group">
                <PhoneCall
                  size={20}
                  className="group-hover:rotate-12 transition-transform"
                />
                Contact Host
              </button>

              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                Verified Listing • No Hidden Charges
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
