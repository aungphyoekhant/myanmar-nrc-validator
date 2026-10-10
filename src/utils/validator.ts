import kachinData from "../data/townships/kachin.json" with { type: "json" };
import kayahData from "../data/townships/kayah.json" with { type: "json" };
import kayinData from "../data/townships/kayin.json" with { type: "json" };
import chinData from "../data/townships/chin.json" with { type: "json" };
import sagaingData from "../data/townships/sagaing.json" with { type: "json" };
import tanintharyiData from "../data/townships/tanintharyi.json" with { type: "json" };
import bagoData from "../data/townships/bago.json" with { type: "json" };
import magwayData from "../data/townships/magway.json" with { type: "json" };
import mandalayData from "../data/townships/mandalay.json" with { type: "json" };
import monData from "../data/townships/mon.json" with { type: "json" };
import rakhineData from "../data/townships/rakhine.json" with { type: "json" };
import yangonData from "../data/townships/yangon.json" with { type: "json" };
import shanData from "../data/townships/shan.json" with { type: "json" };
import ayeyarwadyData from "../data/townships/ayeyarwady.json" with { type: "json" };

const TOWNSHIP_FILES: Record<string, any> = {
  "1": kachinData,
  "2": kayahData,
  "3": kayinData,
  "4": chinData,
  "5": sagaingData,
  "6": tanintharyiData,
  "7": bagoData,
  "8": magwayData,
  "9": mandalayData,
  "10": monData,
  "11": rakhineData,
  "12": yangonData,
  "13": shanData,
  "14": ayeyarwadyData,
};

export function normalizeDigits(input: string): string {
  if (!input) return "";
  const mmDigits: Record<string, string> = {
    "၀": "0",
    "၁": "1",
    "၂": "2",
    "၃": "3",
    "၄": "4",
    "၅": "5",
    "၆": "6",
    "၇": "7",
    "၈": "8",
    "၉": "9",
  };
  return input.replace(/[၀-၉]/g, (digit) => mmDigits[digit] || digit);
}

export function isValidTownship(
  stateCode: string,
  townshipCode: string,
): boolean {
  if (!stateCode || !townshipCode) return false;

  const stateFile = TOWNSHIP_FILES[stateCode];
  if (!stateFile || !stateFile.townships) return false;

  const query = townshipCode.trim().toUpperCase();
  const rawQuery = townshipCode.trim();

  return stateFile.townships.some(
    (t: any) =>
      t.en.toUpperCase() === query ||
      t.mm === rawQuery ||
      t.fullEn.toUpperCase() === query ||
      t.fullMm === rawQuery,
  );
}

export function validateNRC(nrcString: string): boolean {
  if (!nrcString || typeof nrcString !== "string") return false;

  const cleaned = normalizeDigits(nrcString.trim());

  const nrcPattern =
    /^([1-9]|1[0-4])\/([A-Za-z\u1000-\u109F]+)\((N|P|A|T|နိုင်|ပြု|ဧည့်|ယာယီ)\)([0-9]{6})$/i;

  const match = cleaned.match(nrcPattern);
  if (!match || !match[1] || !match[2]) return false;

  const stateCode = match[1];
  const township = match[2];

  return isValidTownship(stateCode, township);
}
