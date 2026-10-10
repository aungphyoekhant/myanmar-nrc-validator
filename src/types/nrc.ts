export type StateCode =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14;

export type CitizenTypeCode = "N" | "P" | "A" | "T";
export type CitizenTypeMm = "နိုင်" | "ပြု" | "ဧည့်" | "ယာယီ";
export type CitizenType = CitizenTypeCode | CitizenTypeMm;

export interface ParsedNRC {
  stateCode: string;
  stateNameEn: string;
  stateNameMm: string;
  township: string;
  type: CitizenType;
  number: string;
  raw: string;
}

export interface ComposeOptions {
  stateCode: StateCode;
  township: string;
  type: CitizenType;
  number: string | number;
}
