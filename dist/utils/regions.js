import statesData from "../data/states.json" with { type: "json" };
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
const TOWNSHIP_FILES = {
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
const STATE_REGIONS = statesData;
export function getStates() {
    return Object.entries(STATE_REGIONS).map(([code, info]) => ({
        code,
        en: info.en,
        mm: info.mm,
    }));
}
export function getStateTownships(stateCode) {
    if (stateCode === undefined || stateCode === null)
        return null;
    const codeStr = String(stateCode).trim();
    const stateFile = TOWNSHIP_FILES[codeStr];
    const stateInfo = STATE_REGIONS[codeStr];
    if (!stateFile || !stateInfo) {
        return null;
    }
    return {
        stateCode: codeStr,
        stateNameEn: stateInfo.en,
        stateNameMm: stateInfo.mm,
        townships: stateFile.townships,
    };
}
//# sourceMappingURL=regions.js.map