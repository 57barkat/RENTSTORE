import type { Metadata } from "next";

import LandingHero from "@/app/components/public/LandingHero";
import {
  ActiveAreasSection,
  IntentPathsSection,
  OwnerCTA,
  TrustSection,
  type ActiveAreaCardItem,
} from "@/app/components/public/LandingSections";
import { PropertyService } from "@/app/lib/PropertyService";
import type { PropertyCategory } from "@/app/lib/property-types";
import { BRAND_NAME } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export const revalidate = 1800;

const LAUNCH_MARKET_CITY = "Islamabad";

const ACTIVE_AREA_CATEGORY_ORDER: PropertyCategory[] = [
  "hostel",
  "apartment",
  "home",
  "shop",
  "office",
];

const CATEGORY_HINT_LABELS: Partial<Record<PropertyCategory, string>> = {
  hostel: "Hostels",
  apartment: "Apartments",
  home: "Houses",
  shop: "Shops",
  office: "Offices",
};

export const metadata: Metadata = {
  title: `Find your Angan in Islamabad | ${BRAND_NAME}`,
  description:
    "Start your Islamabad rental search with AnganStay. Explore student stays, family-ready homes, commercial spaces, and active areas with cleaner listings.",
  alternates: {
    canonical: toAbsoluteUrl("/"),
  },
  openGraph: {
    title: `Find your Angan in Islamabad | ${BRAND_NAME}`,
    description:
      "Start your Islamabad rental search with AnganStay. Explore student stays, family-ready homes, commercial spaces, and active areas with cleaner listings.",
    type: "website",
    url: toAbsoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: `Find your Angan in Islamabad | ${BRAND_NAME}`,
    description:
      "Start your Islamabad rental search with AnganStay. Explore student stays, family-ready homes, commercial spaces, and active areas with cleaner listings.",
  },
};

type AreaAccumulator = {
  area: string;
  city: string;
  activeListingCount: number;
  categories: Set<PropertyCategory>;
};

const buildActiveAreaHref = (city: string, area: string) => {
  const params = new URLSearchParams();

  params.set("city", city);
  params.set("location", area);

  return `/property?${params.toString()}`;
};

const formatCategoryHints = (categories: Set<PropertyCategory>) =>
  ACTIVE_AREA_CATEGORY_ORDER.filter((category) => categories.has(category))
    .map((category) => CATEGORY_HINT_LABELS[category])
    .filter(Boolean) as string[];

const buildContextLine = (categoryHints: string[]) => {
  if (categoryHints.length === 0) {
    return undefined;
  }

  if (categoryHints.length === 1) {
    return `Active rental listings for ${categoryHints[0].toLowerCase()}.`;
  }

  return `Active rental listings across ${categoryHints
    .slice(0, 3)
    .join(", ")
    .toLowerCase()}.`;
};

async function getActiveAreas(): Promise<ActiveAreaCardItem[]> {
  const categoryResults = await Promise.all(
    ACTIVE_AREA_CATEGORY_ORDER.map(async (category) => {
      try {
        const items = await PropertyService.getPopularLocations({
          city: LAUNCH_MARKET_CITY,
          propertyType: category,
          purpose: "rent",
          limit: 6,
        });

        return { category, items };
      } catch {
        return { category, items: [] };
      }
    }),
  );

  const areasByKey = new Map<string, AreaAccumulator>();

  categoryResults.forEach(({ category, items }) => {
    items.forEach((item) => {
      const area = item.area.trim();
      const city = item.city.trim() || LAUNCH_MARKET_CITY;
      const activeListingCount = item.listingCount || item.count || 0;

      if (!area || activeListingCount <= 0) return;

      const key = `${city.toLowerCase()}::${area.toLowerCase()}`;
      const existing = areasByKey.get(key);

      if (existing) {
        existing.activeListingCount += activeListingCount;
        existing.categories.add(category);
        return;
      }

      areasByKey.set(key, {
        area,
        city,
        activeListingCount,
        categories: new Set([category]),
      });
    });
  });

  return Array.from(areasByKey.values())
    .map((item) => {
      const categoryHints = formatCategoryHints(item.categories);

      return {
        area: item.area,
        activeListingCount: item.activeListingCount,
        href: buildActiveAreaHref(item.city, item.area),
        contextLine: buildContextLine(categoryHints),
        categoryHints,
      };
    })
    .sort(
      (left, right) => right.activeListingCount - left.activeListingCount,
    )
    .slice(0, 6);
}

export default async function HomePage() {
  const activeAreas = await getActiveAreas();

  return (
    <div className="min-h-screen overflow-x-clip bg-[linear-gradient(180deg,_var(--admin-card)_0%,_var(--admin-background)_32%,_var(--admin-card)_100%)]">
      <LandingHero />
      <IntentPathsSection />
      <ActiveAreasSection items={activeAreas} />
      <TrustSection />
      <OwnerCTA />
    </div>
  );
}
