import fs from "fs/promises";
import crypto from "crypto";
import type { BankGradeScanResult, ScanOptions } from "../types/scanner.js";
import { scanAndValidateWithRetry } from "./nrc-scanner.js";

type CachedResult = BankGradeScanResult & {
  attemptsMade: number;
};

const ocrCache = new Map<string, CachedResult>();

export async function scanWithCache(
  imagePathOrBuffer: string | Buffer,
  options: ScanOptions = {},
): Promise<CachedResult> {
  const buffer =
    typeof imagePathOrBuffer === "string"
      ? await fs.readFile(imagePathOrBuffer)
      : imagePathOrBuffer;

  const optionsHash = JSON.stringify(
    Object.entries(options).sort(([a], [b]) => a.localeCompare(b)),
  );

  const key = crypto
    .createHash("sha256")
    .update(buffer)
    .update(optionsHash)
    .digest("hex");

  const cached = ocrCache.get(key);

  if (cached) {
    console.log("[Cache] Hit");
    return { ...cached };
  }

  console.log("[Cache] Miss");

  const result = await scanAndValidateWithRetry(buffer, options);

  if (result.success) {
    ocrCache.set(key, result);
  }

  return result;
}

export function clearOCRCache(): void {
  ocrCache.clear();
}
