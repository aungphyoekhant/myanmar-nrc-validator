import statesData from "./data/states.json" with { type: "json" };
import citizenTypesData from "./data/citizen-types.json" with { type: "json" };
export const STATE_REGIONS = statesData;
export const CITIZENSHIP_TYPES = citizenTypesData;
export function getCitizenTypes() {
    return Object.entries(CITIZENSHIP_TYPES).map(([code, info]) => ({
        code,
        en: info.en,
        mm: info.mm,
    }));
}
export { validateNRC, isValidTownship } from "./utils/validator.js";
export { parseNRC, getCitizenType } from "./utils/parser.js";
export { composeNRC } from "./utils/composer.js";
export { getStates, getStateTownships } from "./utils/regions.js";
export { formatNRC } from "./utils/formatter.js";
//# sourceMappingURL=index.js.map