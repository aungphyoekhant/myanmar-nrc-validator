import { parseNRC } from "./parser.js";
import { composeNRC } from "./composer.js";
function toMyanmarDigits(input) {
    const enDigits = {
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
const TYPE_MAP = {
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
export function formatNRC(nrcString, target) {
    const parsed = parseNRC(nrcString);
    if (!parsed)
        return null;
    const typeObj = TYPE_MAP[parsed.type] || { en: "N", mm: "နိုင်" };
    const citizenType = target === "mm" ? typeObj.mm : typeObj.en;
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
    return `${stateMmDigits}/${parsed.township}(${citizenType})${numberMmDigits}`;
}
//# sourceMappingURL=formatter.js.map