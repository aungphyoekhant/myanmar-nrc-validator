import statesData from "./data/states.json" with { type: "json" };
import citizenTypesData from "./data/citizen-types.json" with { type: "json" };

export const STATE_REGIONS = statesData as Record<
  string,
  { en: string; mm: string }
>;
export const CITIZENSHIP_TYPES = citizenTypesData as unknown as Record<
  string,
  { en: string; mm: string }
>;

export function getCitizenTypes() {
  return Object.entries(CITIZENSHIP_TYPES).map(([code, info]) => ({
    code,
    en: info.en,
    mm: info.mm,
  }));
}

export { validateNRC, isValidTownship } from "./utils/validator.js";
export { parseNRC, getCitizenType } from "./utils/parser.js";
export type { ParsedNRC } from "./utils/parser.js";
export { composeNRC } from "./utils/composer.js";
export type { ComposeOptions, CitizenType } from "./utils/composer.js";
export { getStates, getStateTownships } from "./utils/regions.js";
export { formatNRC } from "./utils/formatter.js";
