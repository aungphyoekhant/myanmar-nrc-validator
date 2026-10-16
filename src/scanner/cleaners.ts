import { DocumentType } from "../types/scanner.js";
import {
  LICENSE_FRONT_KEYWORDS,
  LICENSE_BACK_KEYWORDS,
  NRC_FRONT_KEYWORDS,
  NRC_BACK_KEYWORDS,
} from "./keywords.js";

/** 💡 မြန်မာဂဏန်းများကို အင်္ဂလိပ်ဂဏန်းများသို့ ပြောင်းလဲပေးခြင်း (Normalization) */
export function normalizeDigits(text: string): string {
  return text.replace(/[\u1040-\u1049]/g, (ch) =>
    String(ch.charCodeAt(0) - 0x1040),
  );
}

/** 💡 ယာဉ်မောင်းလိုင်စင် နံပါတ် (Front) သို့မဟုတ် Serial နံပါတ် (Back) ရှာဖွေခြင်း */
export function extractAndCleanLicense(rawText: string): {
  licenseNumber: string;
  serialNumber: string;
} {
  const normalized = normalizeDigits(rawText);

  // 1. ရှေ့ဆုံးမှာ Keywords (No., လိုင်စင် စသည်ဖြင့်) ပါသည်ဖြစ်စေ, မပါသည်ဖြစ်စေ ပိုတိကျသော License Pattern
  const licenseRegex =
    /(?:License|DL|လိုင်စင်|အမှတ်|No\.?|စ\s*No\.?)[:\s]*([A-Za-z\u1000-\u109F]\/[\d၀-၉]{3,6}\/\d{2,4})/i;
  let match = normalized.match(licenseRegex);
  let licenseNumber = match && match[1] ? match[1].trim() : "";

  // 2. Keywords မပါဘဲ စာသားထဲက B/03684/18 (သို့) ခ/၀၃၆၈၄/၁၈ ပုံစံကို တိုက်ရိုက်ရှာရန်
  if (!licenseNumber) {
    const simpleMatch = normalized.match(
      /\b([A-Za-z\u1000-\u109F]\/[\d၀-၉]{3,6}\/\d{2,4})\b/i,
    );
    if (simpleMatch) {
      licenseNumber = simpleMatch[1].trim();
    }
  }

  const serialMatch = normalized.match(/([A-Z0-9]{1,2}-[0-9]{5,7})/i);
  const serialNumber =
    serialMatch && serialMatch[1] ? serialMatch[1].trim() : "";

  return { licenseNumber, serialNumber };
}

/** 💡 NRC (နိုင်ငံသားစိစစ်ရေးကတ်) နံပါတ်ကို ပုံစံအမျိုးမျိုးဖြင့် ရှာဖွေဖယ်ထုတ်ခြင်း */
export function extractAndCleanNRC(rawText: string): string {
  const normalized = normalizeDigits(rawText);

  const nrcRegex =
    /(\d{1,2}\/[A-Za-z\u1000-\u109F()]+(?:\(နိုင်\)?|\(နိုင်ငံ\)?|\(ပြု\)?|\(စ\)?|\([က-အ]+\))\s*\d{6})/i;
  const match = normalized.match(nrcRegex);

  if (match) {
    return match[0].replace(/\s+/g, "");
  }

  const labelIndex = normalized.indexOf("မှတ်ပုံတင်");
  if (labelIndex !== -1) {
    const subText = normalized.substring(labelIndex, labelIndex + 50);
    const cleaned = subText.replace(/[^\d/()\u1000-\u109F]/g, "");
    if (cleaned.length >= 10) return cleaned;
  }

  return "";
}

/** 💡 Document အမျိုးအစားကို Keywords များနှင့် Format များအပေါ်မူတည်၍ တိကျစွာ ခွဲခြားခြင်း */
export function detectDocumentType(rawText: string): DocumentType {
  const text = normalizeDigits(rawText).toLowerCase();

  const countMatches = (keywords: string[]) =>
    keywords.filter((keyword) =>
      text.includes(normalizeDigits(keyword).toLowerCase()),
    ).length;

  // 🪪 Keywords များကို အသုံးပြု၍ Score တွက်ချက်ခြင်း
  const licenseFrontScore = countMatches(LICENSE_FRONT_KEYWORDS);
  const licenseBackScore = countMatches(LICENSE_BACK_KEYWORDS);
  const nrcFrontScore = countMatches(NRC_FRONT_KEYWORDS);
  const nrcBackScore = countMatches(NRC_BACK_KEYWORDS);

  // 🔍 Regex Patterns ဖြင့် Format ကိုပါ ထပ်မံစစ်ဆေးခြင်း
  const hasNrcFormat = /\d{1,2}\/[A-Za-z\u1000-\u109F()]+\s*\d{6}/i.test(text);
  const hasLicenseSerial = /\b[A-Z0-9]{1,2}-[0-9]{5,7}\b/i.test(text);

  // ==========================================
  // 🏆 1. Driving License Back (ကျောဘက်) ကို အရင်ဆုံး စစ်ဆေးခြင်း
  // ==========================================
  if (
    hasLicenseSerial ||
    licenseBackScore >= 2 ||
    text.includes("စတင်ထုတ်ပေး") ||
    text.includes("မောင်းနှင်ခွင့်ရှိသည့်") ||
    text.includes("ယာဉ်အမျိုးအစား") ||
    text.includes("ကန့်သတ်ချက်")
  ) {
    return "LICENSE_BACK";
  }

  // ==========================================
  // 🏆 2. Driving License Front (ရှေ့ဘက်) ကို စစ်ဆေးခြင်း
  // ==========================================
  if (
    licenseFrontScore >= 2 ||
    text.includes("licence") ||
    text.includes("license") ||
    text.includes("ယာဉ်မောင်း") ||
    text.includes("ယာဥ်မောင်း") ||
    text.includes("ကုန်းလမ်းပို့ဆောင်ရေး") ||
    text.includes("drivimnc") ||
    text.includes("drivimc")
  ) {
    return "LICENSE_FRONT";
  }

  // ==========================================
  // 🏆 3. NRC Back (ကျောဘက်) ကို စစ်ဆေးခြင်း
  // ==========================================
  if (
    nrcBackScore >= 2 ||
    text.includes("အဘအမည်") ||
    text.includes("နေရပ်လိပ်စာ") ||
    text.includes("လက်ဝဲလက်မ")
  ) {
    return "NRC_BACK";
  }

  // ==========================================
  // 🏆 4. NRC Front (ရှေ့ဘက်) ကို စစ်ဆေးခြင်း
  // ==========================================
  if (
    hasNrcFormat ||
    nrcFrontScore >= 2 ||
    text.includes("နိုင်ငံသားစိစစ်") ||
    text.includes("စိစစ်ရေးကတ်") ||
    text.includes("ထင်ရှားသည့်အမှတ်")
  ) {
    return "NRC_FRONT";
  }

  return "UNKNOWN";
}
