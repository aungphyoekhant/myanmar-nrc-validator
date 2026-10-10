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

export type CitizenType =
  | "N"
  | "P"
  | "A"
  | "T"
  | "နိုင်"
  | "ပြု"
  | "ဧည့်"
  | "ယာယီ";

export interface ComposeOptions {
  stateCode: string | number;
  township: string;
  type: CitizenType;
  number: string | number;
}

function resolveTownshipCode(
  stateCode: string,
  townshipInput: string,
): string | null {
  const stateFile = TOWNSHIP_FILES[stateCode];
  if (!stateFile || !stateFile.townships) return null;

  const query = townshipInput.trim().toUpperCase();
  const rawQuery = townshipInput.trim();

  const found = stateFile.townships.find(
    (t: any) =>
      t.en.toUpperCase() === query ||
      t.mm === rawQuery ||
      t.fullEn.toUpperCase() === query ||
      t.fullMm === rawQuery,
  );

  return found ? found.en.toUpperCase() : null;
}

export function composeNRC(options: ComposeOptions): string | null {
  if (!options) return null;

  const { stateCode, township, type, number } = options;

  if (stateCode === undefined || !township || !type || number === undefined) {
    return null;
  }

  const stateStr = String(stateCode).trim();
  const typeStr = String(type).trim();
  const numStr = String(number).trim();

  const stateNum = parseInt(stateStr, 10);
  if (isNaN(stateNum) || stateNum < 1 || stateNum > 14) {
    return null;
  }

  const resolvedTownship = resolveTownshipCode(stateStr, String(township));
  if (!resolvedTownship) {
    return null;
  }

  const validTypes: CitizenType[] = [
    "N",
    "P",
    "A",
    "T",
    "နိုင်",
    "ပြု",
    "ဧည့်",
    "ယာယီ",
  ];
  if (!validTypes.includes(typeStr as CitizenType)) {
    return null;
  }

  const cleanNumber = numStr.replace(/[^0-9]/g, "");
  if (cleanNumber.length !== 6) {
    return null;
  }

  return `${stateNum}/${resolvedTownship}(${typeStr})${cleanNumber}`;
}
