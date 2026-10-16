import type { Township } from "../types/nrc.js";
export interface StateInfo {
    code: string;
    en: string;
    mm: string;
}
export declare function getStates(): StateInfo[];
export declare function getStateTownships(stateCode: string | number): {
    stateCode: string;
    stateNameEn: string;
    stateNameMm: string;
    townships: Township[];
} | null;
//# sourceMappingURL=regions.d.ts.map