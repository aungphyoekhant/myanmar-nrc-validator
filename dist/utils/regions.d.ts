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
    townships: any;
} | null;
//# sourceMappingURL=regions.d.ts.map