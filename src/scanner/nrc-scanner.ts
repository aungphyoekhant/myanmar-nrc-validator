import { validateNRC, isValidTownship } from "../utils/validator.js";
import { parseNRC } from "../utils/parser.js";
import { acquireWorker, releaseWorker } from "./worker-pool.js";
import type { ScanOptions, BankGradeScanResult } from "../types/scanner.js";
import {
  normalizeDigits,
  extractAndCleanNRC,
  extractAndCleanLicense,
  detectDocumentType,
} from "./cleaners.js";
import { preprocessImage } from "./preprocessor.js";

const OCR_TIMEOUT_MS = 30_000;
const MIN_CONFIDENCE_THRESHOLD = 60;

export async function scanAndValidateNRCImage(
  imagePathOrBuffer: string | Buffer,
  options: ScanOptions = {},
): Promise<BankGradeScanResult> {
  const minConfidence = options.minConfidence ?? MIN_CONFIDENCE_THRESHOLD;
  const smartCoreApproval = options.smartCoreApproval ?? true;

  const worker = await acquireWorker();

  const run = async () => {
    const { processedBuffer: buffer1 } = await preprocessImage(
      imagePathOrBuffer,
      options,
    );
    const ret1 = await worker.recognize(buffer1);

    let rawText = ret1.data.text;
    let confidence = ret1.data.confidence;
    let extractedNRC = extractAndCleanNRC(rawText);
    const licenseInfo = extractAndCleanLicense(rawText);

    if (
      !extractedNRC &&
      !licenseInfo.licenseNumber &&
      !licenseInfo.serialNumber
    ) {
      const { processedBuffer: buffer2 } = await preprocessImage(
        imagePathOrBuffer,
        { ...options, contrastMultiplier: 1.4, brightnessOffset: 20 },
      );

      const ret2 = await worker.recognize(buffer2);
      const fallbackLicense = extractAndCleanLicense(ret2.data.text);

      if (
        ret2.data.confidence > confidence ||
        extractAndCleanNRC(ret2.data.text) ||
        fallbackLicense.licenseNumber ||
        fallbackLicense.serialNumber
      ) {
        rawText = ret2.data.text;
        confidence = ret2.data.confidence;
      }
    }

    return { text: rawText, confidence };
  };

  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("OCR processing timed out")),
      OCR_TIMEOUT_MS,
    );
  });

  const runPromise = run();
  let runSettled = false;
  // If the timeout wins, keep this worker out of the pool until Tesseract
  // finishes the in-flight recognize call.
  void runPromise.then(
    () => { runSettled = true; },
    () => { runSettled = true; },
  );

  try {
    const ocrResult = await Promise.race([runPromise, timeout]);
    if (timer) clearTimeout(timer);

    const rawText = ocrResult.text;
    const confidence = ocrResult.confidence;
    const normalizedText = normalizeDigits(rawText);

    const documentType = detectDocumentType(rawText);
    const extractedNRC = extractAndCleanNRC(rawText);
    const licenseInfo = extractAndCleanLicense(rawText);

    let isValidNRC = false;
    let parsedData = null;

    if (extractedNRC) {
      const isFormatValid = validateNRC(extractedNRC);
      if (isFormatValid) {
        const pData = parseNRC(extractedNRC);
        parsedData = pData;

        if (pData) {
          const stateKey = pData.stateCode || (pData as any).state;
          if (stateKey && pData.township) {
            // Bug fix: t.code is the STATE code (e.g. 12), never a township
            // name, so comparing t.code === township was always false.
            isValidNRC = isValidTownship(stateKey, pData.township);
          }
        }
      }
    }

    let isValid = false;
    if (documentType === "NRC_FRONT") {
      isValid = isValidNRC;
    } else if (documentType === "NRC_BACK") {
      isValid =
        rawText.includes("အဘအမည်") ||
        rawText.includes("နေရပ်လိပ်စာ") ||
        rawText.includes("အလုပ်အကိုင်") ||
        Boolean(extractedNRC);
    } else if (documentType === "LICENSE_FRONT") {
      isValid = Boolean(licenseInfo.licenseNumber);
    } else if (documentType === "LICENSE_BACK") {
      isValid = Boolean(licenseInfo.serialNumber) || rawText.length > 50;
    }

    let requiresManualReview =
      confidence < minConfidence || !isValid || documentType === "UNKNOWN";

    if (smartCoreApproval && isValid) {
      requiresManualReview = false;
    }

    return {
      success: true,
      documentType,
      rawText,
      normalizedText,
      extractedNRC,
      extractedLicense: licenseInfo.licenseNumber,
      extractedSerial: licenseInfo.serialNumber,
      confidence,
      isValid,
      requiresManualReview,
      data: parsedData,
    };
  } catch (error: any) {
    if (timer) clearTimeout(timer);
    return {
      success: false,
      error: error.message || "Error occurred during bank-grade OCR scanning",
    };
  } finally {
    if (runSettled) {
      releaseWorker(worker);
    } else {
      void runPromise.then(
        () => releaseWorker(worker),
        () => releaseWorker(worker),
      );
    }
  }
}

/** 💡 Document တစ်ခုခု (သို့မဟုတ် Type တစ်ခုခု) ရတာနဲ့ Retry မလုပ်တော့ဘဲ ချက်ချင်း Return ပြန်မည့် Early Exit Logic */
export async function scanAndValidateWithRetry(
  imagePathOrBuffer: string | Buffer,
  baseOptions: ScanOptions = {},
): Promise<BankGradeScanResult & { attemptsMade: number }> {
  const maxAttempts = 3;
  let attemptsMade = 0;
  let lastResult: BankGradeScanResult = {
    success: false,
    error: "No attempts made yet",
  };

  const mergedOptions: ScanOptions = {
    resizeWidth: 1500,
    rotateDegrees: 0,
    grayscale: true,
    normalize: true,
    contrastMultiplier: 1.2,
    ...baseOptions,
  };

  // ❌ Buffer အဖြစ် ကြိုဖတ်ထားခြင်းကို ဖြုတ်လိုက်ပါ (Sharp က string path ကို ကိုင်တွယ်တာ ပိုကောင်းပါတယ်)
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attemptsMade = attempt;
    console.log(`\n--- OCR Attempt ${attempt} of ${maxAttempts} ---`);

    let currentOptions: ScanOptions = { ...mergedOptions };

    if (attempt === 2) {
      console.log("Adjusting contrast for Attempt 2...");
      currentOptions.contrastMultiplier = 1.4;
      currentOptions.brightnessOffset = 15;
    } else if (attempt === 3) {
      console.log("Fine-tuning for Final Attempt (3)...");
      currentOptions.contrastMultiplier = 1.5;
      currentOptions.brightnessOffset = 20;
    }

    // 💡 imagePathOrBuffer ကို တိုက်ရိုက် ပို့ပေးပါ
    const result = await scanAndValidateNRCImage(
      imagePathOrBuffer,
      currentOptions,
    );
    lastResult = result;

    const isKnownDocument =
      result.documentType && result.documentType !== "UNKNOWN";

    if (isKnownDocument) {
      console.log(
        `✅ Successfully identified document type [${result.documentType}] on attempt ${attempt}. Early exit triggered.`,
      );
      return {
        ...result,
        success: true,
        attemptsMade,
      };
    }

    console.log(
      `⚠️ Attempt ${attempt} resulted in UNKNOWN or incomplete data. Retrying...`,
    );
  }

  console.log(
    "❌ Reached maximum 3 attempts. Final result confirmed as UNKNOWN.",
  );
  return {
    ...lastResult,
    attemptsMade,
  };
}
