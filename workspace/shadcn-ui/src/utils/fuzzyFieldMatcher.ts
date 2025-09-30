// src/utils/fuzzyFieldMatcher.ts
// Complete, drop-in fuzzy field mapper for MLS-style CSVs.
// - Robust alias → canonical mapping (incl. property sub-type, architectural style, etc.)
// - USPS street suffix normalization (store USPS abbr, compute display line)
// - Features parsing and normalization
// - Photo URL collection from explicit fields + numbered/heuristic columns
// - Numeric/string normalizers
// - Header mapper with light fuzzy matching
// - validateMLSData() export for callers that expect it

export type CanonicalListing = {
  // identity
  id?: string;
  mlsNumber?: string;
  parcelId?: string;

  // address
  streetNumber?: string;
  streetName?: string;
  streetSuffix?: string;   // stored as USPS abbreviation (e.g., ST, AVE, DR)
  streetLine?: string;     // display line: "123 Main ST Unit 4"
  unitNumber?: string;
  city?: string;
  state?: string;          // UPPER CASE
  zip?: string;
  subdivision?: string;

  // core attrs
  price?: number;
  beds?: number;
  baths?: number;          // derived: full + 0.5*half
  fullBaths?: number;
  halfBaths?: number;
  livingAreaSqft?: number;
  lotSizeSqft?: number;

  propertyType?: string;
  propertySubType?: string;
  architecturalStyle?: string;

  yearBuilt?: number;
  garageSpaces?: number;

  features?: string[];
  photos?: string[];

  // contacts
  listingAgentName?: string;
  listingAgentPhone?: string;
  brokerageName?: string;
  brokerageLicense?: string;

  // misc
  status?: string;
  latitude?: number;
  longitude?: number;
};

// USPS standardized suffixes (values should remain UPPER)
const USPS_SUFFIX: Record<string, string> = {
  alley:"ALY", annex:"ANX", arcade:"ARC", avenue:"AVE", bayou:"BYU", beach:"BCH",
  bend:"BND", bluff:"BLF", bluffs:"BLFS", bottom:"BTM", boulevard:"BLVD", branch:"BR",
  bridge:"BRG", brook:"BRK", brooks:"BRKS", bypass:"BYP", camp:"CP", canyon:"CYN",
  cape:"CPE", causeway:"CSWY", center:"CTR", centres:"CTRS", circle:"CIR", cove:"CV",
  creek:"CRK", crescent:"CRES", crossing:"XING", dale:"DL", dam:"DM", divide:"DV",
  drive:"DR", expressway:"EXPY", extension:"EXT", field:"FLD", flat:"FLT", flats:"FLTS",
  ford:"FRD", forest:"FRST", forge:"FRG", fork:"FRK", forks:"FRKS", fort:"FT", freeway:"FWY",
  garden:"GDN", gateway:"GTWY", glen:"GLN", green:"GRN", grove:"GRV", harbor:"HBR",
  haven:"HVN", heights:"HTS", highway:"HWY", hill:"HL", hills:"HLS", hollow:"HOLW",
  inlet:"INLT", island:"IS", islands:"ISS", junction:"JCT", key:"KY", knoll:"KNL",
  lake:"LK", lakes:"LKS", landing:"LNDG", lane:"LN", light:"LGT", loaf:"LF", lock:"LCK",
  lodge:"LDG", manor:"MNR", meadow:"MDW", meadows:"MDWS", mill:"ML", mission:"MSN",
  mount:"MT", mountain:"MTN", neck:"NCK", orchard:"ORCH", oval:"OVAL", park:"PARK",
  parkway:"PKWY", pass:"PASS", path:"PATH", pike:"PIKE", pine:"PNE", place:"PL",
  plain:"PLN", plaza:"PLZ", point:"PT", port:"PRT", prairie:"PR", radial:"RADL",
  ranch:"RNCH", rapids:"RPDS", rest:"RST", ridge:"RDG", river:"RIV", road:"RD",
  route:"RTE", row:"ROW", run:"RUN", shoal:"SHL", shore:"SHR", spring:"SPG", springs:"SPGS",
  square:"SQ", station:"STA", stravenue:"STRA", stream:"STRM", street:"ST", summit:"SMT",
  terrace:"TER", trace:"TRCE", track:"TRAK", trail:"TRL", tunnel:"TUNL", turnpike:"TPKE",
  union:"UN", valley:"VLY", viaduct:"VIA", view:"VW", village:"VLG", ville:"VL",
  vista:"VIS", walk:"WALK", way:"WAY", well:"WL", woods:"WDS",
};

type AliasMap = Record<string, string[]>;

// Aliases from messy MLS headers → canonical keys
export const FIELD_ALIASES: AliasMap = {
  // identity
  mlsNumber: ["mlsnumber","mls_id","mls#","listingid","listing_id","mls"],
  parcelId: ["parcelid","parcel_id","pid","apn","strap"],

  // address components
  streetNumber: ["streetnumber","stnumber","house_number","addr_number"],
  streetName: ["streetname","stname","addr_street"],
  streetSuffix: ["streetsuffix","stsuffix","suffix","street_suffix","streettype","street_type"],
  unitNumber: ["unit","unitnumber","apt","apartment","suite","ste","unit_no","unitnumberfull"],
  city: ["city","municipality","locality"],
  state: ["state","province","region","stateorprovince","state_province"],
  zip: ["zip","zipcode","postalcode","zip_code","zip4","zip+4"],
  subdivision: ["subdivision","neighborhood","community","subdivisionname","neighborhoodname"],

  // numbers
  price: ["listprice","price","list_price","askingprice"],
  beds: ["bedrooms","bedrooms_total","beds","br"],
  fullBaths: ["fullbaths","full_baths","baths_full"],
  halfBaths: ["halfbaths","half_baths","partials","partial_baths","baths_half"],
  livingAreaSqft: ["livingsf","livingareasqft","sqft","buildingarea","totallivingsf","living_area","gross_living_area"],
  lotSizeSqft: ["lotsize","lotsizesqft","lot_sqft","lot_area","total_area_lot"],

  // types
  propertyType: ["propertytype","prop_type","type"],
  propertySubType: ["propertysubtype","prop_sub_type","sub_type","propertystyle","subtype"],
  architecturalStyle: ["architecturalstyle","arch_style","style","architecture"],

  yearBuilt: ["yearbuilt","yr_built","year_built"],
  garageSpaces: ["garagespaces","garage_spaces","carportspaces","parkinggarage","parking_spaces"],

  // features
  features: ["features","amenities","interiorfeatures","exteriorfeatures","communityfeatures","community_features"],

  // media (common MLS variants)
  photos: [
    "photos","photo_urls","images","image_urls","mediaphotos",
    "photourl","photo_url","primaryphotourl","primary_photo_url",
    "mediaurl","media_url","imageurl","image_url","largephotourl",
    "thumbnailurl","thumbnail_url","virtualtoururl","virtual_tour_url"
  ],

  // contacts
  listingAgentName: ["listingagent","agentname","listagentfullname","list_agent_full_name","list_agent_name"],
  listingAgentPhone: ["agentphone","listagentphone","list_agent_phone","agent_phone"],
  brokerageName: ["brokerage","listingoffice","office_name","brokerage_name","listing_office_name"],
  brokerageLicense: ["brokeragelicense","office_license","broker_license","listing_office_license"],

  // misc
  status: ["status","listingstatus","list_status"],
  latitude: ["lat","latitude"],
  longitude: ["lng","lon","longitude"],
};

// Build reverse lookup once
const HEADER_TO_CANONICAL: Record<string, keyof CanonicalListing> = {};
for (const canonical in FIELD_ALIASES) {
  const k = canonical as keyof CanonicalListing;
  FIELD_ALIASES[k].forEach(a => { HEADER_TO_CANONICAL[a] = k; });
}

// ---------- helpers ----------
const toNumber = (v: any): number | undefined => {
  if (v === null || v === undefined) return undefined;
  const num = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(num) ? num : undefined;
};
const toInt = (v: any): number | undefined => {
  const n = toNumber(v);
  return Number.isFinite(n!) ? Math.round(n!) : undefined;
};
const cleanStr = (v: any): string | undefined => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
};
const titleCase = (s?: string) =>
  s ? s.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase()) : s;

function normalizeStreetSuffix(raw?: string): { abbr?: string; display?: string } {
  if (!raw) return {};
  const key = String(raw).toLowerCase().trim();
  // already an abbreviation?
  if (/^[A-Z]{2,4}$/.test(String(raw))) {
    const display = Object.keys(USPS_SUFFIX).find(k => USPS_SUFFIX[k] === raw);
    return { abbr: String(raw), display: display ? titleCase(display) : String(raw) };
  }
  const abbr = USPS_SUFFIX[key];
  return { abbr: abbr || undefined, display: titleCase(key) };
}

function parseFeatures(val: any): string[] | undefined {
  const s = cleanStr(val);
  if (!s) return undefined;
  const raw = s.split(/[,;/|]+/).map(x => x.trim().toLowerCase()).filter(Boolean);
  const map: Record<string,string> = {
    "pool":"pool","private pool":"pool","community pool":"pool_community",
    "waterfront":"waterfront","new construction":"new_construction","newly built":"new_construction",
    "gated":"gated","hoa":"hoa","fireplace":"fireplace","fenced":"fenced",
    "corner lot":"corner_lot","cul-de-sac":"cul_de_sac","dock":"dock","boat lift":"boat_lift",
    "impact windows":"impact_windows","garage":"garage","carport":"carport"
  };
  const out: string[] = [];
  raw.forEach(r => { out.push(map[r] || r.replace(/\s+/g, "_")); });
  return Array.from(new Set(out));
}

/** Collect photo URLs from:
 * - explicit 'photos' fields (string/JSON/CSV)
 * - any columns matching /(photo|image|media).*(url|link|\d+)/i
 * - numbered columns: photo1..photo20, image_url_1, etc.
 */
function collectPhotoUrls(row: Record<string, any>, headerMap: Record<string, keyof CanonicalListing>): string[] {
  const urls: string[] = [];

  const pushMaybe = (v: any) => {
    if (v == null) return;
    // JSON array in a string cell
    if (typeof v === "string" && v.trim().startsWith("[")) {
      try {
        const arr = JSON.parse(v);
        if (Array.isArray(arr)) { arr.forEach(u => pushMaybe(u)); return; }
      } catch { /* ignore */ }
    }
    // delimited list
    if (typeof v === "string") {
      v.split(/[,;|\s]+/).forEach(piece => {
        const p = piece.trim();
        if (/^https?:\/\//i.test(p)) urls.push(p);
      });
      return;
    }
    // object with url field
    if (typeof v === "object" && v?.url && /^https?:\/\//i.test(v.url)) {
      urls.push(v.url);
      return;
    }
    // single string URL
    if (typeof v === "string" && /^https?:\/\//i.test(v)) urls.push(v);
  };

  // 1) explicit photos fields via headerMap
  Object.entries(headerMap).forEach(([hdr, canon]) => {
    if (canon === "photos") pushMaybe(row[hdr]);
  });

  // 2) heuristic scan of all keys
  for (const key of Object.keys(row)) {
    const lk = key.toLowerCase();
    if (
      /(photo|image|media).*(url|link|\d+)/i.test(lk) ||
      /^(photo|image|media)(\d+)$/.test(lk) ||
      /^(photo|image|media)[ _-]?url(\d+)?$/.test(lk)
    ) {
      pushMaybe(row[key]);
    }
  }

  // uniq + valid http(s)
  return Array.from(new Set(urls.filter(u => /^https?:\/\//i.test(u))));
}

// ---------- public API ----------

/** Build a header map from incoming headers using fuzzy aliases */
export function buildHeaderMap(headers: string[]): Record<string, keyof CanonicalListing> {
  const map: Record<string, keyof CanonicalListing> = {};
  headers.forEach(h => {
    const lower = (h || "").toLowerCase().trim();
    if (!lower) return;

    // direct alias match
    if (HEADER_TO_CANONICAL[lower]) { map[lower] = HEADER_TO_CANONICAL[lower]; return; }

    // squashed (remove non-alnum)
    const squashed = lower.replace(/[^a-z0-9]/g, "");
    if (HEADER_TO_CANONICAL[squashed]) { map[lower] = HEADER_TO_CANONICAL[squashed]; return; }

    // heuristics
    if (lower.includes("agent") && lower.includes("phone")) map[lower] = "listingAgentPhone";
    else if (lower.includes("agent") && (lower.includes("name") || lower.includes("full"))) map[lower] = "listingAgentName";
    else if ((lower.includes("broker") || lower.includes("office")) && lower.includes("license")) map[lower] = "brokerageLicense";
  });
  return map;
}

/** Map a parsed CSV row (already header: value) to CanonicalListing */
export function mapRecordToCanonical(
  row: Record<string, any>,
  headerMap: Record<string, keyof CanonicalListing>
): CanonicalListing {
  const out: CanonicalListing = {};
  const lowerRow: Record<string, any> = {};
  Object.keys(row).forEach(k => (lowerRow[String(k).toLowerCase()] = row[k]));

  // project through headerMap
  for (const rawHeader in headerMap) {
    const canonical = headerMap[rawHeader];
    const val = lowerRow[rawHeader];

    switch (canonical) {
      case "price":
      case "beds":
      case "fullBaths":
      case "halfBaths":
      case "livingAreaSqft":
      case "lotSizeSqft":
      case "garageSpaces":
      case "yearBuilt":
      case "latitude":
      case "longitude":
        (out as any)[canonical] = (canonical === "yearBuilt") ? toInt(val) : toNumber(val);
        break;

      case "features": {
        const parsed = parseFeatures(val);
        if (parsed?.length) out.features = parsed;
        break;
      }

      case "photos":
        // handled after loop (we collect from multiple columns)
        break;

      case "streetSuffix": {
        const { abbr } = normalizeStreetSuffix(String(val || ""));
        out.streetSuffix = abbr || cleanStr(val)?.toUpperCase();
        break;
      }

      default:
        (out as any)[canonical] = cleanStr(val) ?? (out as any)[canonical];
    }
  }

  // photos collected from explicit + heuristic columns
  const collected = collectPhotoUrls(lowerRow, headerMap);
  if (collected.length) out.photos = collected;

  // derive total baths
  if (out.fullBaths || out.halfBaths) {
    const full = out.fullBaths || 0;
    const half = out.halfBaths || 0;
    out.baths = full + half * 0.5;
  }

  // compose a display street line if missing
  if (!out.streetLine) {
    const parts = [
      out.streetNumber,
      out.streetName ? titleCase(out.streetName) : undefined,
      out.streetSuffix, // USPS abbr in data; display components can titleCase elsewhere
      out.unitNumber ? `Unit ${out.unitNumber}` : undefined,
    ].filter(Boolean);
    out.streetLine = parts.join(" ");
  }

  // display casing / standardization
  if (out.city) out.city = titleCase(out.city);
  if (out.subdivision) out.subdivision = titleCase(out.subdivision);
  if (out.state) out.state = out.state.toUpperCase();

  return out;
}

// Quick schema check for a normalized listing row.
// Ensures key fields like MLS number, address, and price exist.
// Returns { valid: boolean, missing: string[] }.
export function validateMLSData(row: Record<string, any>): { valid: boolean; missing: string[] } {
  // These are the minimum fields your app expects to render / filter safely.
  const required = ["mlsNumber", "streetLine", "city", "state", "zip", "price"];
  const missing = required.filter((f) => {
    const v = (row as any)[f];
    return v === undefined || v === null || v === "";
  });
  return { valid: missing.length === 0, missing };
}

// Backwards-compatible alias: mapCSVHeaders → buildHeaderMap
// Accept an optional "threshold" to match existing call sites, but ignore it.
export function mapCSVHeaders(
  headers: string[],
  _threshold?: number
): Record<string, keyof CanonicalListing> {
  return buildHeaderMap(headers);
}

// Field definitions (array) so callers can iterate/filter
export interface MLSFieldDef {
  key: keyof CanonicalListing;
  label: string;
  required?: boolean;
}

export const MLS_FIELD_DEFINITIONS: MLSFieldDef[] = [
  { key: "mlsNumber",        label: "MLS Number",            required: true },
  { key: "parcelId",         label: "Parcel ID" },
  { key: "streetNumber",     label: "Street Number",         required: true },
  { key: "streetName",       label: "Street Name",           required: true },
  { key: "streetSuffix",     label: "Street Suffix" },
  { key: "streetLine",       label: "Street Line" }, // computed if missing
  { key: "unitNumber",       label: "Unit Number" },
  { key: "city",             label: "City",                  required: true },
  { key: "state",            label: "State",                 required: true },
  { key: "zip",              label: "ZIP Code",              required: true },
  { key: "subdivision",      label: "Subdivision" },
  { key: "price",            label: "List Price",            required: true },
  { key: "beds",             label: "Bedrooms" },
  { key: "baths",            label: "Total Bathrooms" },
  { key: "fullBaths",        label: "Full Bathrooms" },
  { key: "halfBaths",        label: "Half Bathrooms" },
  { key: "livingAreaSqft",   label: "Living Area (sqft)" },
  { key: "lotSizeSqft",      label: "Lot Size (sqft)" },
  { key: "propertyType",     label: "Property Type" },
  { key: "propertySubType",  label: "Property Sub-Type" },
  { key: "architecturalStyle", label: "Architectural Style" },
  { key: "yearBuilt",        label: "Year Built" },
  { key: "garageSpaces",     label: "Garage Spaces" },
  { key: "features",         label: "Features" },
  { key: "photos",           label: "Photos" },
  { key: "listingAgentName", label: "Listing Agent Name" },
  { key: "listingAgentPhone",label: "Listing Agent Phone" },
  { key: "brokerageName",    label: "Brokerage Name" },
  { key: "brokerageLicense", label: "Brokerage License" },
  { key: "status",           label: "Status" },
  { key: "latitude",         label: "Latitude" },
  { key: "longitude",        label: "Longitude" },
];

// Map (by key) for quick lookups if needed
export const MLS_FIELD_DEFINITIONS_MAP: Record<string, MLSFieldDef> =
  Object.fromEntries(MLS_FIELD_DEFINITIONS.map(d => [d.key, d]));
// Backwards-compatible helper: normalize a raw CSV cell value
export function processFieldValueCSV(
  field: string,
  value: any
): any {
  switch (field) {
    case "price":
    case "beds":
    case "fullBaths":
    case "halfBaths":
    case "livingAreaSqft":
    case "lotSizeSqft":
    case "garageSpaces":
    case "yearBuilt":
    case "latitude":
    case "longitude":
      return field === "yearBuilt" ? toInt(value) : toNumber(value);

    case "features":
      return parseFeatures(value);

    case "streetSuffix": {
      const { abbr } = normalizeStreetSuffix(String(value || ""));
      return abbr || cleanStr(value)?.toUpperCase();
    }

    default:
      return cleanStr(value);
  }
}

// Default export (handy if some files import default)
export default {
  buildHeaderMap,
  mapRecordToCanonical,
  validateMLSData,
  mapCSVHeaders,
  MLS_FIELD_DEFINITIONS,
  MLS_FIELD_DEFINITIONS_MAP,
  processFieldValueCSV,
};