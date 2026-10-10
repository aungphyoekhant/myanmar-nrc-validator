import statesData from "../data/states.json" with { type: "json" };
import { validateNRC, isValidTownship, normalizeDigits } from "./validator.js";
import citizenTypesData from "../data/citizen-types.json" with { type: "json" };

const STATE_REGIONS = statesData as Record<string, { en: string; mm: string }>;

export interface ParsedNRC {
  stateCode: string;
  stateNameEn: string;
  stateNameMm: string;
  township: string;
  type: string;
  number: string;
  raw: string;
}

export function parseNRC(nrcString: string): ParsedNRC | null {
  if (!nrcString || typeof nrcString !== "string") {
    return null;
  }

  const normalized = normalizeDigits(nrcString.trim());

  if (!validateNRC(normalized)) {
    return null;
  }

  const regex =
    /^([1-9]|1[0-4])\/([A-Za-z\u1000-\u109F]+)\(([^)]+)\)([0-9]{6})$/;
  const match = normalized.match(regex);

  if (!match || !match[1] || !match[2] || !match[3] || !match[4]) {
    return null;
  }

  const stateCode: string = match[1];
  const township = match[2].toUpperCase();
  const type = match[3];
  const number = match[4];

  if (!isValidTownship(stateCode, township)) {
    return null;
  }

  const stateInfo = STATE_REGIONS[stateCode] || { en: "", mm: "" };

  return {
    stateCode,
    stateNameEn: stateInfo.en,
    stateNameMm: stateInfo.mm,
    township,
    type,
    number,
    raw: nrcString.trim(),
  };
}

export function getCitizenType(
  nrcString?: string,
): string | null | Array<{ code: string; en: string; mm: string }> {
  if (!nrcString || typeof nrcString !== "string" || nrcString.trim() === "") {
    return Object.entries(citizenTypesData).map(
      ([code, info]: [string, any]) => ({
        code,
        en: info.en,
        mm: info.mm,
      }),
    );
  }

  const match = nrcString.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}
