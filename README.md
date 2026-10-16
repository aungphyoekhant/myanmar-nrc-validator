# 🇲🇲 myanmar-nrc-validator

**Validate, parse, format, compose, and scan Myanmar National Registration Card (NRC) numbers using TypeScript and JavaScript.**

A TypeScript/JavaScript library for working with Myanmar NRC numbers, state and region codes, township data, and citizen-type labels. It also provides OCR-based document scanning capabilities through a scanner module.

[![npm version](https://img.shields.io/npm/v/myanmar-nrc-validator.svg)](https://www.npmjs.com/package/myanmar-nrc-validator)
[![npm downloads](https://img.shields.io/npm/dm/myanmar-nrc-validator.svg)](https://www.npmjs.com/package/myanmar-nrc-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Supported-blue.svg)](https://www.typescriptlang.org/)

> Built for Node.js, TypeScript, JavaScript, NestJS, Express.js, React, and other modern JavaScript applications.

## ✨ Features

- **NRC Validation** — Validate NRC strings against the package's supported NRC structure and data.
- **NRC Parsing** — Extract state number, township code, citizen type, and ID number.
- **NRC Formatting** — Convert between Myanmar and English NRC formats.
- **NRC Composition** — Construct NRC strings programmatically.
- **State and Township Utilities** — Retrieve supported state/region and township data.
- **Citizen Type Utilities** — Retrieve citizen types and their labels.
- **Zod Integration** — Validate NRC input using a Zod schema.
- **OCR Image Scanning** — Extract text from document images using Tesseract.js.
- **Document Type Detection** — Identify likely NRC and driving licence front/back images.
- **Image Preprocessing** — Resize, grayscale, normalize, sharpen, rotate, and optionally threshold images.
- **Confidence and Review Flags** — Inspect OCR confidence and determine whether additional review is required.
- **Node.js Buffer Support** — Process uploaded image buffers without requiring permanent file storage.
- **CLI Support** — Validate and parse NRC values from the terminal.
- **TypeScript Support** — Use typed APIs and declarations.

## 📦 Installation

Install the package:

```bash
npm install myanmar-nrc-validator
```

For applications that use the OCR scanner, install its runtime dependencies as well:

```bash
npm install tesseract.js sharp
```

The OCR scanner requires:

- `tesseract.js` — Optical character recognition (OCR).
- `sharp` — Image preprocessing.

The core NRC utilities and the OCR scanner may have different runtime dependencies depending on how the package is built and published.

## 💻 CLI Usage

Validate and inspect NRC numbers directly from the terminal.

### English NRC

```bash
npx myanmar-nrc-validator "12/UKAMA(N)123456"
```

### Myanmar NRC

```bash
npx nrc "၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆"
```

The exact CLI command depends on the executable names configured in the published package's `package.json`.

## 🚀 Programmatic Usage

Import the core utilities from the package:

```typescript
import {
  validateNRC,
  parseNRC,
  formatNRC,
  composeNRC,
  getCitizenType,
  getStates,
  getStateTownships,
  getCitizenTypes,
  nrcStringSchema,
} from "myanmar-nrc-validator";
```

## 1. Validate NRC

Use `validateNRC()` to check an NRC string.

```typescript
import { validateNRC } from "myanmar-nrc-validator";

console.log(validateNRC("၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆"));

console.log(validateNRC("12/UKAMA(N)123456"));

console.log(validateNRC("99/XYZ(N)123456"));
```

The validator checks the NRC format and relevant supported state/township information.

A successful result does not prove that a physical card is authentic or that the person presenting it owns the card.

## 2. Parse NRC

Use `parseNRC()` to extract structured information.

```typescript
import { parseNRC } from "myanmar-nrc-validator";

const result = parseNRC("၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆");

console.log(result);
```

Example structure:

```typescript
{
  stateNumber: "12",
  townshipCode: "ဥကမ",
  citizenType: "နိုင်",
  number: "၁၂၃၄၅၆"
}
```

The actual returned values depend on the input and the package's parser implementation.

English input is also supported:

```typescript
const result = parseNRC("12/UKAMA(N)123456");

console.log(result);
```

Use parsed data to populate form fields, prepare API payloads, or organize application records.

## 3. Get Citizen Type

Use `getCitizenType()` to retrieve the citizen type associated with an NRC.

```typescript
import { getCitizenType } from "myanmar-nrc-validator";

const citizenType = getCitizenType("12/UKAMA(N)123456");

console.log(citizenType);
```

You can also retrieve the available citizen-type list:

```typescript
const citizenTypes = getCitizenType();

console.log(citizenTypes);
```

Example:

```typescript
[
  {
    code: "N",
    en: "Citizen",
    mm: "နိုင်",
  },
  {
    code: "P",
    en: "Associate Citizen",
    mm: "ဧည့်",
  },
  {
    code: "A",
    en: "Naturalized Citizen",
    mm: "ပြု",
  },
  {
    code: "T",
    en: "Temporary",
    mm: "ယာယီ",
  },
];
```

The available entries depend on the package's built-in data.

## 4. Format NRC

Use `formatNRC()` to convert between supported Myanmar and English formats.

### Myanmar to English

```typescript
import { formatNRC } from "myanmar-nrc-validator";

const result = formatNRC("၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆", "en");

console.log(result);
```

Example output:

```text
12/UKAMA(N)123456
```

### English to Myanmar

```typescript
const result = formatNRC("12/UKAMA(N)123456", "mm");

console.log(result);
```

Example output:

```text
၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆
```

Formatting changes the representation of the input. It does not independently verify a physical document.

## 5. Get States and Regions

Retrieve supported state and region data.

```typescript
import { getStates } from "myanmar-nrc-validator";

const states = getStates();

console.log(states);
```

Use this function to populate state/region selectors or display supported NRC region information.

## 6. Get Townships for a State

Use `getStateTownships()` to retrieve the townships associated with a state or region.

```typescript
import { getStateTownships } from "myanmar-nrc-validator";

const townships = getStateTownships("12");

console.log(townships);
```

In the package's NRC data, `"12"` represents Yangon Region.

Use the returned structure according to the actual types exported by your installed package.

## 7. Get All Citizen Types

```typescript
import { getCitizenTypes } from "myanmar-nrc-validator";

const citizenTypes = getCitizenTypes();

console.log(citizenTypes);
```

This is useful for building dropdowns, displaying citizen-type labels, and integrating NRC information into registration forms.

## 🧩 Compose NRC

Use `composeNRC()` to build an NRC string from individual components.

### Myanmar format

```typescript
import { composeNRC } from "myanmar-nrc-validator";

const nrc = composeNRC({
  stateNumber: "12",
  townshipCode: "ဥကမ",
  citizenType: "နိုင်",
  number: "123456",
  format: "mm",
});

console.log(nrc);
```

Example output:

```text
၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆
```

### English format

```typescript
const nrc = composeNRC({
  stateNumber: "12",
  townshipCode: "UKAMA",
  citizenType: "N",
  number: "123456",
  format: "en",
});

console.log(nrc);
```

Example output:

```text
12/UKAMA(N)123456
```

Use the supported township codes and citizen-type values from the installed package.

## 🛡️ Zod Schema Validation

Use `nrcStringSchema` to validate NRC input in forms and application APIs.

```typescript
import { nrcStringSchema } from "myanmar-nrc-validator";

const result = nrcStringSchema.safeParse("၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆");

if (result.success) {
  console.log("Valid NRC!");
} else {
  console.error("Validation failed:", result.error.format());
}
```

Zod validation is useful for checking user input before sending it to an API or saving it in a database.

## 🔎 OCR Image Scanning and Validation

The OCR scanner provides an additional workflow for extracting information from images of Myanmar NRCs and driving licences.

It uses Tesseract.js for OCR and Sharp for image preprocessing.

### Supported document types

| Document type   | Description                |
| --------------- | -------------------------- |
| `NRC_FRONT`     | NRC front side             |
| `NRC_BACK`      | NRC back side              |
| `LICENSE_FRONT` | Driving licence front side |
| `LICENSE_BACK`  | Driving licence back side  |
| `UNKNOWN`       | Unrecognized document type |

**Important:** Document type detection and extracted text are automated estimates. They do not prove document authenticity or identity.

### Scanner import

The following example uses a scanner file in your own project:

```typescript
import { scanAndValidateNRCImage } from "./scanner/nrc-scanner.js";
```

If the scanner is exposed as a public subpath or package-root export, use the corresponding import path from your package's published exports.

### 1. Basic OCR scanning

```typescript
import { scanAndValidateNRCImage } from "./scanner/nrc-scanner.js";

async function main() {
  const result = await scanAndValidateNRCImage("./public/nrc-front.jpg");

  if (!result.success) {
    console.error("Scanning failed:", result.error);
    return;
  }

  console.log("Document type:", result.documentType);
  console.log("Extracted NRC:", result.extractedNRC);
  console.log("Extracted licence:", result.extractedLicense);
  console.log("Serial number:", result.extractedSerial);
  console.log("Confidence:", result.confidence);
  console.log("Valid:", result.isValid);
  console.log("Manual review:", result.requiresManualReview);
  console.log("Parsed NRC:", result.data);
}

main().catch(console.error);
```

### 2. Custom image preprocessing

Customize preprocessing to improve recognition for images with low resolution, noise, poor contrast, or incorrect orientation.

```typescript
import { scanAndValidateNRCImage } from "./scanner/nrc-scanner.js";

async function testScan() {
  const imagePath = "./public/image.png";

  console.log("Scanning and validating NRC image...");

  const result = await scanAndValidateNRCImage(imagePath, {
    // Increase image resolution
    resizeWidth: 2200,

    // Image preprocessing
    grayscale: true,
    normalize: true,
    median: 1,
    contrastMultiplier: 1.2,
    brightnessOffset: 0,
    sharpenSigma: 1,

    // Rotate when necessary
    rotateDegrees: 0,

    // Optional thresholding
    useThreshold: false,
    thresholdValue: 120,

    // OCR confidence threshold
    minConfidence: 60,

    // Save processed image for debugging
    debug: true,
    debugOutputPath: "./tmp/debug-processed.jpg",
  });

  console.log("----------------------------------------");

  if (!result.success) {
    console.error("Scan failed:", result.error);
    return;
  }

  console.log(JSON.stringify(result, null, 2));

  console.log("----------------------------------------");
}

testScan().catch(console.error);
```

**Image preprocessing tips**

- Increase `resizeWidth` when the original image is too small.
- Try `rotateDegrees` when the document is rotated.
- Use `grayscale` and `normalize` to prepare the image for OCR.
- Adjust `contrastMultiplier` and `brightnessOffset` carefully.
- Use `median` to reduce noise when appropriate.
- Enable `useThreshold` only when black-and-white conversion improves your test images.
- Use `debugOutputPath` to inspect the processed image during development.

The best settings depend on image quality. Test with a representative set of images instead of assuming one configuration will work for every document.

### 3. Scanner configuration options

| Option               | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `resizeWidth`        | Target width for resizing                            |
| `zoomScale`          | Additional scaling factor                            |
| `grayscale`          | Convert the image to grayscale                       |
| `normalize`          | Normalize image contrast                             |
| `median`             | Reduce image noise                                   |
| `contrastMultiplier` | Adjust contrast                                      |
| `brightnessOffset`   | Adjust brightness                                    |
| `sharpenSigma`       | Sharpen text edges                                   |
| `rotateDegrees`      | Rotate the image                                     |
| `useThreshold`       | Enable threshold-based black-and-white conversion    |
| `thresholdValue`     | Threshold cutoff                                     |
| `minConfidence`      | Configure the OCR confidence threshold               |
| `smartCoreApproval`  | Control the scanner's automatic review-flag behavior |
| `debug`              | Save the processed image                             |
| `debugOutputPath`    | Set the debug image path                             |

In the current scanner implementation, `minConfidence` defaults to 65 when not provided. The custom example above uses 60.

The scanner also has a processing timeout. Applications should handle unsuccessful scans and retry only when appropriate.

### 4. Scan an image from a Buffer

The scanner accepts a file path or a Node.js `Buffer`.

This is useful when an image comes from an upload form.

```typescript
import { scanAndValidateNRCImage } from "./scanner/nrc-scanner.js";

async function scanUploadedImage(buffer: Buffer) {
  const result = await scanAndValidateNRCImage(buffer, {
    minConfidence: 70,
    debug: false,
  });

  if (!result.success) {
    return {
      status: "SCAN_FAILED",
      message: result.error,
    };
  }

  if (!result.isValid || result.requiresManualReview) {
    return {
      status: "MANUAL_REVIEW",
      documentType: result.documentType,
      confidence: result.confidence,
      extractedNRC: result.extractedNRC,
    };
  }

  return {
    status: "AUTOMATED_CHECKS_PASSED",
    documentType: result.documentType,
    confidence: result.confidence,
    extractedNRC: result.extractedNRC,
    data: result.data,
  };
}
```

The final status represents your application's workflow decision, not proof of identity or document authenticity.

### 5. Understanding OCR results

The scanner returns a `BankGradeScanResult` object.

| Field                  | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `success`              | Whether the scan completed and returned a result |
| `documentType`         | Detected document category                       |
| `rawText`              | Raw OCR text                                     |
| `normalizedText`       | OCR text with Myanmar digits normalized          |
| `extractedNRC`         | Extracted NRC candidate                          |
| `extractedLicense`     | Extracted driving licence candidate              |
| `extractedSerial`      | Extracted serial number candidate                |
| `confidence`           | OCR engine confidence score                      |
| `isValid`              | Result of the current document-specific checks   |
| `requiresManualReview` | Current review flag                              |
| `data`                 | Parsed NRC information, when available           |
| `error`                | Error message when scanning fails                |

The `success` field and `isValid` field have different meanings.

For example, an image can be processed successfully even when the document cannot be identified or the extracted NRC is invalid.

The current driving licence checks rely on extracted patterns and text. They do not establish that a licence is officially valid.

### 6. Express.js integration

The following example shows an upload endpoint using Express and Multer.

Install the additional dependencies:

```bash
npm install express multer
npm install -D @types/express @types/multer
```

Example:

```typescript
import express from "express";
import multer from "multer";
import { scanAndValidateNRCImage } from "./scanner/nrc-scanner.js";

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.post("/api/nrc/scan", upload.single("document"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Document image is required.",
    });
  }

  try {
    const result = await scanAndValidateNRCImage(req.file.buffer, {
      minConfidence: 70,
      debug: false,
    });

    if (!result.success) {
      return res.status(422).json({
        message: "Unable to process the document.",
        error: result.error,
      });
    }

    return res.status(200).json({
      success: result.success,
      documentType: result.documentType,
      confidence: result.confidence,
      extractedNRC: result.extractedNRC,
      isValid: result.isValid,
      requiresManualReview: result.requiresManualReview,
      data: result.data,
    });
  } catch {
    return res.status(500).json({
      message: "An unexpected scanning error occurred.",
    });
  }
});

app.listen(3000, () => {
  console.log("API listening on port 3000");
});
```

This is a minimal integration example. A production API should also validate the uploaded file's actual content, apply authentication and authorization, use rate limiting, and implement centralized error handling.

### 7. NestJS integration

The scanner can be called from a NestJS service.

```typescript
import { Injectable } from "@nestjs/common";
import { scanAndValidateNRCImage } from "./scanner/nrc-scanner.js";

@Injectable()
export class NrcScanService {
  async scan(buffer: Buffer) {
    const result = await scanAndValidateNRCImage(buffer, {
      minConfidence: 70,
      debug: false,
    });

    if (!result.success) {
      return {
        status: "SCAN_FAILED" as const,
        message: result.error,
      };
    }

    if (!result.isValid || result.requiresManualReview) {
      return {
        status: "MANUAL_REVIEW" as const,
        documentType: result.documentType,
        confidence: result.confidence,
        extractedNRC: result.extractedNRC,
      };
    }

    return {
      status: "AUTOMATED_CHECKS_PASSED" as const,
      documentType: result.documentType,
      confidence: result.confidence,
      extractedNRC: result.extractedNRC,
      data: result.data,
    };
  }
}
```

Register the service in your NestJS module and call it from a controller that accepts a validated uploaded file.

Configure your upload interceptor, file-size limits, DTOs, error handling, and review workflow according to your application.

### 8. Real-world OCR use cases

**Customer registration**

Extract an NRC candidate from an uploaded image to prefill a registration form. Ask the user to confirm the extracted value.

**Customer onboarding**

Use OCR to reduce manual data entry, then route uncertain results to an authorized reviewer.

**HR and employee management**

Extract NRC information during employee registration while retaining the required verification steps.

**Fleet and driver management**

Extract candidate driving licence numbers or serial numbers during driver onboarding.

**Document processing systems**

Identify likely NRC and driving licence front/back images to help route documents through an automated workflow.

**Batch OCR processing**

Process multiple documents through a queue with concurrency limits, error handling, retries, and controlled data retention.

### 9. Production best practices

- Test with representative images across different lighting, rotation, blur, and resolution conditions.
- Enforce upload size limits and validate actual image content.
- Use concurrency limits because OCR can consume significant CPU and memory.
- Keep debug output disabled in production unless explicitly needed.
- Avoid logging raw OCR text and complete NRC numbers unnecessarily.
- Encrypt stored documents and restrict access to authorized users.
- Apply an appropriate retention and deletion policy for personal information.
- Route uncertain results, missing fields, and low-confidence scans to human review.
- Test false positives, malformed images, OCR failures, and timeouts.
- Do not use OCR results alone to approve identity, citizenship, legal status, or financial transactions.

**Security notice:** OCR assists document processing. It does not independently establish identity or document authenticity.

## 🏗️ Logical NRC Data Model

The NRC data can be understood using the following logical relationships:

```text
┌──────────────────┐
│      States      │
├──────────────────┤
│ id               │
│ number           │
│ name_en          │
│ name_mm          │
└────────┬─────────┘
         │
         │ 1 : N
         ▼
┌──────────────────┐
│    Townships     │
├──────────────────┤
│ id               │
│ code             │
│ name_en          │
│ name_mm          │
│ state_id         │
└──────────────────┘

┌──────────────────┐
│    NRC Record    │
├──────────────────┤
│ stateNumber      │
│ townshipCode     │
│ citizenType      │
│ number           │
└──────────────────┘
```

This is a conceptual model for explaining NRC structure. It is not a declaration that the library creates database tables.

### NRC structure

English:

```text
12/UKAMA(N)123456
```

Myanmar:

```text
၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆
```

| Component     | Example  | Description             |
| ------------- | -------- | ----------------------- |
| State number  | `12`     | NRC state/region number |
| Township code | `UKAMA`  | Township identifier     |
| Citizen type  | `N`      | Citizen category        |
| ID number     | `123456` | NRC number component    |

## 🔄 Library Flow

```text
              Application / CLI
                     │
                     ▼
          myanmar-nrc-validator
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Validate      Parse        Format
        │            │            │
        └────────────┼────────────┘
                     ▼
               NRC Utilities
                     │
                     ▼
          State / Township Data

          OCR Scanner (optional)
                     │
                     ▼
              Image Preprocessing
                     │
                     ▼
                Tesseract OCR
                     │
                     ▼
           Extract and Normalize
                     │
                     ▼
            NRC Validation Checks
                     │
                     ▼
             Review Workflow
```

## 🌐 Supported Use Cases

The package's core utilities can be used in:

- Node.js applications
- TypeScript and JavaScript projects
- NestJS APIs
- Express.js APIs
- React applications
- React Hook Form integrations
- Registration and identity forms
- Database and API input validation
- CLI tools

The OCR scanner can additionally support:

- Document image processing
- Customer onboarding
- Employee registration
- Driving licence data extraction
- Manual-review workflows
- Batch document processing

Browser-based OCR requires a separate browser-compatible implementation and build. The Node.js scanner documented here uses `sharp` and should not be assumed to run directly in a browser.

## 📚 API Overview

| Function / Export           | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `validateNRC()`             | Validate an NRC string                                  |
| `parseNRC()`                | Parse an NRC into structured data                       |
| `formatNRC()`               | Convert supported NRC formats                           |
| `composeNRC()`              | Construct an NRC string                                 |
| `getStates()`               | Get state/region data                                   |
| `getStateTownships()`       | Get townships for a state/region                        |
| `getCitizenTypes()`         | Get all citizen types                                   |
| `getCitizenType()`          | Get a citizen type or the complete list                 |
| `nrcStringSchema`           | Zod NRC validation schema                               |
| `scanAndValidateNRCImage()` | Scan a document image and inspect extracted information |

The OCR scanner's public availability depends on whether its module is included and exported by the published package.

## 🧑‍💻 TypeScript Example

```typescript
type NRC = {
  stateNumber: string;
  townshipCode: string;
  citizenType: string;
  number: string;
};

const nrc: NRC = {
  stateNumber: "12",
  townshipCode: "UKAMA",
  citizenType: "N",
  number: "123456",
};

console.log(nrc);
```

## 📁 Suggested Project Structure

```text
myanmar-nrc-validator/
├── src/
│   ├── data/
│   │   ├── states.ts
│   │   ├── townships.ts
│   │   └── citizen-types.ts
│   │
│   ├── schemas/
│   │   └── nrc.schema.ts
│   │
│   ├── utils/
│   │   ├── normalize.ts
│   │   ├── parser.ts
│   │   ├── formatter.ts
│   │   └── validator.ts
│   │
│   ├── scanner/
│   │   └── nrc-scanner.ts
│   │
│   ├── compose.ts
│   ├── index.ts
│   └── cli.ts
│
├── tests/
│   ├── validate.test.ts
│   ├── parse.test.ts
│   ├── format.test.ts
│   ├── compose.test.ts
│   └── scanner.test.ts
│
├── dist/
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

This is a suggested structure. Your actual project can use a different layout.

## 🤝 Contributing

Contributions, bug reports, improvements, tests, and additional NRC data are welcome.

To contribute:

1. Create a feature branch.
2. Make your changes.
3. Add or update tests.
4. Run the test suite.
5. Build the package.
6. Open a pull request.

Example:

```bash
git checkout -b feature/improve-nrc-validation

npm test

npm run build

git add .

git commit -m "feat: improve NRC validation"

git push origin feature/improve-nrc-validation
```

Use the test and build commands configured in your project's `package.json`.

## 📄 License

MIT License © Aung Phyo Khant

See the `LICENSE` file for the complete license text.

## ⭐ Support

If this package is useful to you, consider giving the repository a ⭐ on GitHub.

Made with ❤️ for Myanmar developers.
