export declare const STATE_REGIONS: Record<string, {
    en: string;
    mm: string;
}>;
export declare const CITIZENSHIP_TYPES: Record<string, {
    en: string;
    mm: string;
}>;
export declare function getCitizenTypes(): {
    code: string;
    en: string;
    mm: string;
}[];
export { validateNRC, isValidTownship } from "./utils/validator.js";
export { parseNRC, getCitizenType } from "./utils/parser.js";
export type { ParsedNRC } from "./utils/parser.js";
export { composeNRC } from "./utils/composer.js";
export type { ComposeOptions, CitizenType } from "./utils/composer.js";
export { getStates, getStateTownships } from "./utils/regions.js";
export { formatNRC } from "./utils/formatter.js";
//# sourceMappingURL=index.d.ts.map