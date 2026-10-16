export declare const STATE_REGIONS: Record<string, {
    en: string;
    mm: string;
}>;
export declare const CITIZENSHIP_TYPES: Record<string, {
    name: string;
    mm: string;
    desc: string;
}>;
export declare function getCitizenTypes(): {
    code: string;
    en: string;
    mm: string;
}[];
export { validateNRC, isValidTownship } from "./utils/validator.js";
export { parseNRC, getCitizenType } from "./utils/parser.js";
export type { ParsedNRC } from "./utils/parser.js";
export { nrcStringSchema, extendZodWithNRC } from "./utils/zod.js";
export { composeNRC } from "./utils/composer.js";
export type { ComposeOptions, CitizenType } from "./utils/composer.js";
export { getStates, getStateTownships } from "./utils/regions.js";
export { formatNRC } from "./utils/formatter.js";
export { scanAndValidateNRCImage, scanAndValidateWithRetry, } from "./scanner/nrc-scanner.js";
export { scanWithCache, clearOCRCache } from "./scanner/cache.js";
export { detectDocumentType, extractAndCleanNRC, extractAndCleanLicense, normalizeDigits, } from "./scanner/cleaners.js";
export type { BankGradeScanResult, ScanOptions, DocumentType, } from "./types/scanner.js";
//# sourceMappingURL=index.d.ts.map