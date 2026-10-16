import { parseNRC } from "./parser.js";
import { composeNRC, type CitizenType } from "./composer.js";
import { getStateTownships } from "./regions.js";

/**
 * Resolve a township (English code OR Myanmar name) to its short
 * Myanmar name for the given state/region.
 * e.g. (12, "UKAMA") -> "ဥကမ"
 */
function toMyanmarTownship(stateCode: string, township: string): string {
  const info = getStateTownships(stateCode);
  if (!info) return township;

  const query = township.trim().toUpperCase();
  const raw = township.trim();

  const found = info.townships.find(
    (t: any) =>
      t.en.toUpperCase() === query ||
      t.mm === raw ||
      t.fullEn.toUpperCase() === query ||
      t.fullMm === raw,
  );

  return found ? found.mm : township;
}

function toMyanmarDigits(input: string): string {
  const enDigits: Record<string, string> = {
    "0": "၀",
    "1": "၁",
    "2": "၂",
    "3": "၃",
    "4": "၄",
    "5": "၅",
    "6": "၆",
    "7": "၇",
    "8": "၈",
    "9": "၉",
  };
  return input.replace(/[0-9]/g, (digit) => enDigits[digit] || digit);
}

const TYPE_MAP: Record<string, { en: string; mm: CitizenType }> = {
  N: { en: "N", mm: "နိုင်" },
  P: { en: "P", mm: "ပြု" },
  A: { en: "A", mm: "ဧည့်" },
  T: { en: "T", mm: "ယာယီ" },
  နိုင်: { en: "N", mm: "နိုင်" },
  ပြု: { en: "P", mm: "ပြု" },
  ဧည့်: { en: "A", mm: "ဧည့်" },
  ယာယီ: { en: "T", mm: "ယာယီ" },
};

/**
 * @param nrcString
 * @param target
 */

export function formatNRC(
  nrcString: string,
  target: "en" | "mm",
): string | null {
  const parsed = parseNRC(nrcString);
  if (!parsed) return null;

  const typeObj = TYPE_MAP[parsed.type] || { en: "N", mm: "နိုင်" };
  const citizenType =
    target === "mm" ? typeObj.mm : (typeObj.en as CitizenType);

  if (target === "en") {
    return composeNRC({
      stateCode: parsed.stateCode,
      township: parsed.township,
      type: citizenType,
      number: parsed.number,
    });
  }

  const stateMmDigits = toMyanmarDigits(parsed.stateCode);
  const numberMmDigits = toMyanmarDigits(parsed.number);
  const mmTownship = toMyanmarTownship(parsed.stateCode, parsed.township);

  return `${stateMmDigits}/${mmTownship}(${citizenType})${numberMmDigits}`;
}
