export type CitizenType = "N" | "P" | "A" | "T" | "နိုင်" | "ပြု" | "ဧည့်" | "ယာယီ";
export interface ComposeOptions {
    stateCode: string | number;
    township: string;
    type: CitizenType;
    number: string | number;
}
export declare function composeNRC(options: ComposeOptions): string | null;
//# sourceMappingURL=composer.d.ts.map