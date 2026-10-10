export interface ParsedNRC {
    stateCode: string;
    stateNameEn: string;
    stateNameMm: string;
    township: string;
    type: string;
    number: string;
    raw: string;
}
export declare function parseNRC(nrcString: string): ParsedNRC | null;
export declare function getCitizenType(nrcString?: string): string | null | Array<{
    code: string;
    en: string;
    mm: string;
}>;
//# sourceMappingURL=parser.d.ts.map