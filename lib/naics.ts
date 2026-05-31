export interface Sector {
  slug: string;
  name: string;
  prefixes: string[]; // 2-digit NAICS prefixes that belong to this sector
}

export const SECTORS: Sector[] = [
  { slug: "agriculture", name: "Agriculture, Forestry, Fishing & Hunting", prefixes: ["11"] },
  { slug: "mining", name: "Mining, Quarrying & Oil & Gas Extraction", prefixes: ["21"] },
  { slug: "utilities", name: "Utilities", prefixes: ["22"] },
  { slug: "construction", name: "Construction", prefixes: ["23"] },
  { slug: "manufacturing", name: "Manufacturing", prefixes: ["31", "32", "33"] },
  { slug: "wholesale-trade", name: "Wholesale Trade", prefixes: ["42"] },
  { slug: "retail-trade", name: "Retail Trade", prefixes: ["44", "45"] },
  { slug: "transportation", name: "Transportation & Warehousing", prefixes: ["48", "49"] },
  { slug: "information", name: "Information", prefixes: ["51"] },
  { slug: "finance-insurance", name: "Finance & Insurance", prefixes: ["52"] },
  { slug: "real-estate", name: "Real Estate, Rental & Leasing", prefixes: ["53"] },
  { slug: "professional-services", name: "Professional, Scientific & Technical Services", prefixes: ["54"] },
  { slug: "management", name: "Management of Companies & Enterprises", prefixes: ["55"] },
  { slug: "administrative-support", name: "Administrative, Support & Waste Management", prefixes: ["56"] },
  { slug: "education", name: "Educational Services", prefixes: ["61"] },
  { slug: "health-care", name: "Health Care & Social Assistance", prefixes: ["62"] },
  { slug: "arts-entertainment", name: "Arts, Entertainment & Recreation", prefixes: ["71"] },
  { slug: "accommodation-food", name: "Accommodation & Food Services", prefixes: ["72"] },
  { slug: "other-services", name: "Other Services (except Public Administration)", prefixes: ["81"] },
  { slug: "public-administration", name: "Public Administration", prefixes: ["92"] },
];

export const SECTOR_BY_SLUG: Map<string, Sector> = new Map(SECTORS.map((s) => [s.slug, s]));

export const PREFIX_TO_SLUG: Map<string, string> = new Map(
  SECTORS.flatMap((s) => s.prefixes.map((p) => [p, s.slug] as [string, string])),
);

export function sectorForSlug(slug: string): Sector | undefined {
  return SECTOR_BY_SLUG.get(slug);
}
