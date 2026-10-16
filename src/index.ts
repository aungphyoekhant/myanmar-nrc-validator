import statesData from "./data/states.json" with { type: "json" };
import citizenTypesData from "./data/citizen-types.json" with { type: "json" };

export const STATE_REGIONS = statesData as Record<
  string,
  { en: string; mm: string }
>;

// citizen-types.json uses keys: name, mm, desc (no "en" key)
export const CITIZENSHIP_TYPES = citizenTypesData as unknown as Record<
  string,
  { name: string; mm: string; desc: string }
>;

export function getCitizenTypes() {
  return Object.entries(CITIZENSHIP_TYPES).map(([code, info]) => ({
    code,
    en: info.name,
    mm: info.mm,
  }));
}

// NRC validation
export { validateNRC, isValidTownship } from "./utils/validator.js";

// NRC parsing
export { parseNRC, getCitizenType } from "./utils/parser.js";
export type { ParsedNRC } from "./utils/parser.js";

// Zod integration
export { nrcStringSchema, extendZodWithNRC } from "./utils/zod.js";

// NRC composition
export { composeNRC } from "./utils/composer.js";
export type { ComposeOptions, CitizenType } from "./utils/composer.js";

// Regions
export { getStates, getStateTownships } from "./utils/regions.js";

// Formatting
export { formatNRC } from "./utils/formatter.js";

// ==========================================
// 💡 OCR Scanner Exports (New Modularized Paths)
// ==========================================

// 1. Main Scanner & Retry Functions (nrc-scanner.ts မှ)
export {
  scanAndValidateNRCImage,
  scanAndValidateWithRetry,
} from "./scanner/nrc-scanner.js";

// 2. Cache Function (cache.ts မှ)
export { scanWithCache, clearOCRCache } from "./scanner/cache.js";

// 3. Cleaners & Detectors (cleaners.ts မှ)
export {
  detectDocumentType,
  extractAndCleanNRC,
  extractAndCleanLicense,
  normalizeDigits,
} from "./scanner/cleaners.js";

// 4. Scanner Types & Interfaces (types/scanner.ts မှ)
export type {
  BankGradeScanResult,
  ScanOptions,
  DocumentType,
} from "./types/scanner.js";
