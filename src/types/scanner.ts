import type { parseNRC } from "../utils/parser.js";

export type DocumentType =
  | "NRC_FRONT"
  | "NRC_BACK"
  | "LICENSE_FRONT"
  | "LICENSE_BACK"
  | "UNKNOWN";

export interface ScanOptions {
  resizeWidth?: number;
  zoomScale?: number;
  grayscale?: boolean;
  normalize?: boolean;
  median?: number;
  contrastMultiplier?: number;
  brightnessOffset?: number;
  sharpenSigma?: number;
  rotateDegrees?: number;
  useThreshold?: boolean;
  thresholdValue?: number;
  minConfidence?: number;
  smartCoreApproval?: boolean;
  debug?: boolean;
  debugOutputPath?: string;
}

export interface BankGradeScanResult {
  success: boolean;
  documentType?: DocumentType;
  rawText?: string;
  normalizedText?: string;
  extractedNRC?: string;
  extractedLicense?: string;
  extractedSerial?: string;
  confidence?: number;
  isValid?: boolean;
  requiresManualReview?: boolean;
  data?: ReturnType<typeof parseNRC> | null;
  error?: string;
}
