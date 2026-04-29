import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildPropertyDetailSlug,
  buildLegacyListingRedirectPath,
  buildSeoListingSlug,
  getLegacyCategoryAliasPath,
  getPublicCategoryFromPath,
  parsePropertyDetailSlug,
  parseSeoListingSlug,
  PUBLIC_PROPERTY_ROUTE_MAP,
  slugifyListingValue,
} from "../../app/lib/property-seo.js";

const run = () => {
  assert.equal(slugifyListingValue("Blue Area, Islamabad"), "blue-area-islamabad");

  assert.deepEqual(parseSeoListingSlug("houses-for-rent-in-islamabad"), {
    category: "home",
    propertyType: "house",
    purpose: "rent",
    city: "Islamabad",
    area: null,
    canonicalSegment: "houses-for-rent-in-islamabad",
  });

  assert.deepEqual(parseSeoListingSlug("apartments-for-sale-in-lahore"), {
    category: "apartment",
    propertyType: "apartment",
    purpose: "sale",
    city: "Lahore",
    area: null,
    canonicalSegment: "apartments-for-sale-in-lahore",
  });

  assert.deepEqual(parseSeoListingSlug("apartments-for-rent-in-e-11-1-islamabad"), {
    category: "apartment",
    propertyType: "apartment",
    purpose: "rent",
    city: "Islamabad",
    area: "E-11-1",
    canonicalSegment: "apartments-for-rent-in-e-11-1-islamabad",
  });

  assert.deepEqual(parseSeoListingSlug("houses-for-rent-in-g-13-islamabad"), {
    category: "home",
    propertyType: "house",
    purpose: "rent",
    city: "Islamabad",
    area: "G-13",
    canonicalSegment: "houses-for-rent-in-g-13-islamabad",
  });

  assert.deepEqual(parseSeoListingSlug("hostels-for-rent-in-g-9-islamabad"), {
    category: "hostel",
    propertyType: "hostel",
    purpose: "rent",
    city: "Islamabad",
    area: "G-9",
    canonicalSegment: "hostels-for-rent-in-g-9-islamabad",
  });

  assert.deepEqual(parseSeoListingSlug("shops-for-rent-in-saddar-rawalpindi"), {
    category: "shop",
    propertyType: "shop",
    purpose: "rent",
    city: "Rawalpindi",
    area: "Saddar",
    canonicalSegment: "shops-for-rent-in-saddar-rawalpindi",
  });

  assert.deepEqual(parseSeoListingSlug("offices-for-rent-in-blue-area-islamabad"), {
    category: "office",
    propertyType: "office",
    purpose: "rent",
    city: "Islamabad",
    area: "Blue Area",
    canonicalSegment: "offices-for-rent-in-blue-area-islamabad",
  });

  assert.equal(
    buildSeoListingSlug({
      category: "property",
      purpose: "rent",
      city: "Rawalpindi",
    }),
    "properties-for-rent-in-rawalpindi",
  );

  assert.equal(
    buildSeoListingSlug({
      category: "apartment",
      purpose: "rent",
      city: "Islamabad",
      area: "E-11-1",
    }),
    "apartments-for-rent-in-e-11-1-islamabad",
  );

  assert.equal(
    buildLegacyListingRedirectPath({ category: "home" }),
    "/houses-for-rent-in-islamabad",
  );

  assert.equal(
    buildLegacyListingRedirectPath({ category: "apartment", city: "Lahore" }),
    "/apartments-for-rent-in-lahore",
  );

  assert.equal(
    buildLegacyListingRedirectPath({ category: "hostel", city: "Rawalpindi" }),
    "/hostels-for-rent-in-rawalpindi",
  );

  assert.equal(
    buildLegacyListingRedirectPath({ category: "shop", city: "Islamabad" }),
    "/shops-for-rent-in-islamabad",
  );

  assert.equal(
    buildLegacyListingRedirectPath({ category: "office", city: "Islamabad" }),
    "/offices-for-rent-in-islamabad",
  );
  assert.equal(
    buildPropertyDetailSlug({
      title: "BOYS HOSTEL",
      propertyType: "hostel",
      purpose: "rent",
      area: "G 9",
      city: "Islamabad",
      hostelType: "male",
      propertyId: "69e257c8e0eef033ae914194",
    }),
    "boys-hostel-for-rent-in-g-9-islamabad-69e257",
  );
  assert.equal(
    buildPropertyDetailSlug({
      title: "10 Marly Furnished Ground Portion for Rent in G-131",
      propertyType: "house",
      purpose: "rent",
      area: "g13",
      city: "Islamabad",
      sizeValue: 10,
      sizeUnit: "Marly",
      propertyId: "69ef9463ba2e5dca4cb65977",
    }),
    "ground-portion-for-rent-in-g-13-islamabad-10-marla-69ef94",
  );
  assert.deepEqual(
    parsePropertyDetailSlug("office-for-rent-in-blue-area-islamabad-69e257"),
    {
      slugBody: "office-for-rent-in-blue-area-islamabad",
      propertyId: "69e257",
      isShortId: true,
      propertyType: "office",
      purpose: "rent",
      locationHint: "Blue Area Islamabad",
    },
  );
  const legacySlug = parsePropertyDetailSlug(
    "10-marly-furnished-ground-portion-for-rent-in-g-131-for-rent-in-g-13-islamabad-69ef9463ba2e5dca4cb65977",
  );
  assert.equal(
    legacySlug?.slugBody,
    "10-marly-furnished-ground-portion-for-rent-in-g-131-for-rent-in-g-13-islamabad",
  );
  assert.equal(legacySlug?.propertyId, "69ef9463ba2e5dca4cb65977");
  assert.equal(legacySlug?.isShortId, false);
  assert.equal(legacySlug?.propertyType, "house");
  assert.equal(legacySlug?.purpose, "rent");
  assert.equal(getLegacyCategoryAliasPath("shop"), "/shops");
  assert.equal(getLegacyCategoryAliasPath("office"), "/offices");
  assert.equal(getLegacyCategoryAliasPath("houses"), null);

  assert.deepEqual(PUBLIC_PROPERTY_ROUTE_MAP.shop, {
    category: "shop",
    legacyHref: "/shops",
    seoExampleHref: "/shops-for-rent-in-islamabad",
    label: "Shop",
  });

  assert.equal(getPublicCategoryFromPath("/houses"), "home");
  assert.equal(
    getPublicCategoryFromPath("/houses-for-rent-in-g-13-islamabad"),
    "home",
  );
  assert.equal(getPublicCategoryFromPath("/shops"), "shop");
  assert.equal(
    getPublicCategoryFromPath("/shops-for-rent-in-saddar-rawalpindi"),
    "shop",
  );
  assert.equal(getPublicCategoryFromPath("/offices"), "office");
  assert.equal(
    getPublicCategoryFromPath("/offices-for-rent-in-blue-area-islamabad"),
    "office",
  );
  assert.deepEqual(parseSeoListingSlug("houses-for-rent-in-lahore"), {
    category: "home",
    propertyType: "house",
    purpose: "rent",
    city: "Lahore",
    area: null,
    canonicalSegment: "houses-for-rent-in-lahore",
  });
  assert.deepEqual(parseSeoListingSlug("apartments-for-rent-in-rawalpindi"), {
    category: "apartment",
    propertyType: "apartment",
    purpose: "rent",
    city: "Rawalpindi",
    area: null,
    canonicalSegment: "apartments-for-rent-in-rawalpindi",
  });
  assert.deepEqual(parseSeoListingSlug("shops-for-rent-in-karachi"), {
    category: "shop",
    propertyType: "shop",
    purpose: "rent",
    city: "Karachi",
    area: null,
    canonicalSegment: "shops-for-rent-in-karachi",
  });
  assert.deepEqual(parseSeoListingSlug("offices-for-rent-in-peshawar"), {
    category: "office",
    propertyType: "office",
    purpose: "rent",
    city: "Peshawar",
    area: null,
    canonicalSegment: "offices-for-rent-in-peshawar",
  });
  assert.deepEqual(parseSeoListingSlug("hostels-for-rent-in-peshawar"), {
    category: "hostel",
    propertyType: "hostel",
    purpose: "rent",
    city: "Peshawar",
    area: null,
    canonicalSegment: "hostels-for-rent-in-peshawar",
  });

  assert.equal(parseSeoListingSlug("houses-islamabad"), null);
  assert.equal(parseSeoListingSlug("houses-for-lease-in-islamabad"), null);
  assert.equal(parseSeoListingSlug("villas-for-rent-in-lahore"), null);

  const propertyUtilsSource = readFileSync(
    new URL("../../app/lib/property-utils.ts", import.meta.url),
    "utf8",
  );
  const buildQueryMatch = propertyUtilsSource.match(
    /export const buildPropertySearchQuery = \(\s*filters: PropertySearchFilters,\s*\): string => \{([\s\S]*?)return params\.toString\(\);\s*\};/,
  );

  assert.ok(buildQueryMatch, "buildPropertySearchQuery should be present");
  assert.match(buildQueryMatch[1], /params\.set\("hostOption", filters\.category\)/);
  assert.match(buildQueryMatch[1], /params\.set\("city", filters\.city\)/);
  assert.match(buildQueryMatch[1], /params\.set\("area", filters\.location\)/);
  assert.doesNotMatch(buildQueryMatch[1], /params\.set\("addressQuery", addressQuery\)/);

  const parseParamsMatch = propertyUtilsSource.match(
    /export const parsePropertySearchParams = \([\s\S]*?return \{([\s\S]*?)\n  \};\n\};/,
  );
  assert.ok(parseParamsMatch, "parsePropertySearchParams should be present");
  assert.match(propertyUtilsSource, /const cityValue = toSingleValue\(searchParams\.city\) \|\| "";/);
  assert.match(parseParamsMatch[1], /city: cityValue \? normalizeSeoCity\(cityValue\) : "",/);

  const categoryPageSource = readFileSync(
    new URL("../../app/(public)/[category]/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(categoryPageSource, /filters\.location = seoRoute\.area \|\| "";/);
  assert.match(categoryPageSource, /Area: \{filters\.location\}/);

  const hookSource = readFileSync(
    new URL("../../app/hooks/usePublicProperties.ts", import.meta.url),
    "utf8",
  );
  assert.match(hookSource, /nextFilters\.location = seoRoute\.area \|\| "";/);
  assert.match(hookSource, /omitLocation: Boolean\(nextSeoRoute\)/);

  const routeConstantsSource = readFileSync(
    new URL("../../app/lib/route-constants.ts", import.meta.url),
    "utf8",
  );
  assert.match(routeConstantsSource, /PUBLIC_CATEGORY_ROUTE_MAP\.office\.legacyHref/);
  assert.match(routeConstantsSource, /PUBLIC_CATEGORY_ROUTE_MAP\.office\.category/);

  const legacyDetailRouteSource = readFileSync(
    new URL("../../app/(public)/[category]/[city]/[location]/[id]/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(legacyDetailRouteSource, /redirect\(detail\.canonicalHref\)/);

  const propertyDetailContentSource = readFileSync(
    new URL("../../app/components/properties/PropertyDetailContent.tsx", import.meta.url),
    "utf8",
  );
  assert.match(propertyDetailContentSource, /const title = getPropertyTitle\(property\);/);
  assert.match(propertyDetailContentSource, /\{title\}/);

  const popularLocationsSource = readFileSync(
    new URL("../../app/components/properties/PopularLocationsSection.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(popularLocationsSource, /SEO/);
  assert.match(popularLocationsSource, /View \{browseLabel\} in \{item\.area\}/);

  process.stdout.write("property-seo tests passed\n");
};

run();
