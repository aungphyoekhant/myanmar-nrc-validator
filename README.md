<div align="center">

# 🇲🇲 Myanmar NRC Validator

**Validate, parse, format, compose, and OCR-scan Myanmar National Registration Card (NRC) data with TypeScript and JavaScript.**

A TypeScript-first ESM toolkit with Myanmar state/region and township reference data, citizen-type utilities, Zod validation, OCR workflows, a CLI, and a local Model Context Protocol (MCP) server.

[![npm version](https://img.shields.io/npm/v/myanmar-nrc-validator?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/myanmar-nrc-validator)
[![npm downloads](https://img.shields.io/npm/dm/myanmar-nrc-validator?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/myanmar-nrc-validator)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#license)
[![MCP](https://img.shields.io/badge/Model_Context_Protocol-ready-7357FF?style=for-the-badge)](#model-context-protocol-mcp-server)

[Installation](#installation) · [Quick Start](#quick-start) · [API Reference](#api-reference) · [OCR](#ocr-document-scanning) · [MCP Server](#model-context-protocol-mcp-server) · [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Compatibility](#compatibility)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Command-Line Interface](#command-line-interface)
- [Core API](#core-api)
  - [Validate an NRC](#validate-an-nrc)
  - [Parse NRC components](#parse-nrc-components)
  - [Compose and format NRC values](#compose-and-format-nrc-values)
  - [Work with states, townships, and citizen types](#work-with-states-townships-and-citizen-types)
- [TypeScript and Zod](#typescript-and-zod)
- [OCR document scanning](#ocr-document-scanning)
  - [Scan an image](#scan-an-image)
  - [Scanner utilities](#scanner-utilities)
  - [OCR review guidance](#ocr-review-guidance)
- [Model Context Protocol (MCP) Server](#model-context-protocol-mcp-server)
  - [Run locally](#run-locally)
  - [Claude Desktop configuration](#claude-desktop-configuration)
  - [Cursor configuration](#cursor-configuration)
  - [Available MCP tools](#available-mcp-tools)
- [API Reference](#api-reference)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Security and Privacy](#security-and-privacy)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

`myanmar-nrc-validator` is an ESM package for working with Myanmar National Registration Card (NRC) number strings in TypeScript and JavaScript. It provides utilities for validating, parsing, composing, and formatting NRC values, together with reference data for states/regions, townships, and citizen types.

The package also includes OCR utilities built with Tesseract.js and Sharp, a Zod schema integration, a command-line interface (CLI), and a local stdio Model Context Protocol (MCP) server that exposes supported package functionality as tools for compatible AI clients.

> **Important:** Format validation and reference-data checks do not prove that a physical document is genuine, current, or owned by the person presenting it. OCR output can be inaccurate. Use appropriate manual and authoritative verification for identity, financial, legal, or compliance decisions.

## Features

- **NRC validation** — Check supported NRC strings against the package's format and reference data.
- **Parsing** — Extract the state/region code, township, citizen type, and number from supported NRC strings.
- **Composition and formatting** — Build NRC strings from components and format values in English or Myanmar representation.
- **Myanmar numeral support** — Work with Myanmar digits and supported citizen-type labels.
- **Reference data** — Access state/region, township, and citizen-type data.
- **Township lookup patterns** — Use township fields such as `townshipCode`, `fullEn`, `fullMm`, `en`, and `mm` to build application-specific searches.
- **Zod integration** — Validate values using `nrcStringSchema` or add the `.nrc()` string extension with `extendZodWithNRC()`.
- **OCR scanning** — Scan supported NRC and driving-licence images and inspect extracted values, confidence, document classification, and review flags.
- **Retry and cache utilities** — Use retry-based scanning and option-sensitive result caching.
- **CLI** — Validate an NRC from the terminal.
- **MCP server** — Expose package functionality to compatible local MCP clients such as Claude Desktop and Cursor.
- **TypeScript-first package** — Includes TypeScript declarations and exported types.

## Compatibility

- **Runtime:** Node.js 18 or later, as documented by this project.
- **Module format:** ESM.
- **Languages:** TypeScript and JavaScript.
- **Package manager examples:** npm.
- **OCR:** Uses Tesseract.js and Sharp; platform-specific Sharp installation requirements may apply.

This README describes the documented package API. For the exact current export list and scripts, check the package's `package.json` and TypeScript declarations.

## Installation

Install the package from npm:

```bash
npm install myanmar-nrc-validator
```

The package uses ESM imports:

```typescript
import {
  validateNRC,
  parseNRC,
  composeNRC,
  formatNRC,
} from "myanmar-nrc-validator";
```

## Quick Start

```typescript
import {
  validateNRC,
  parseNRC,
  composeNRC,
  formatNRC,
} from "myanmar-nrc-validator";

const input = "12/UKAMA(N)123456";

// 1. Validate
const isValid = validateNRC(input);
console.log("Valid:", isValid);

// 2. Parse
const parsed = parseNRC(input);

if (parsed) {
  console.log("State/region code:", parsed.stateCode);
  console.log("State/region name:", parsed.stateNameEn);
  console.log("Township:", parsed.township);
  console.log("Citizen type:", parsed.type);
  console.log("Number:", parsed.number);
}

// 3. Compose
const composed = composeNRC({
  stateCode: "12",
  township: "UKAMA",
  type: "N",
  number: "123456",
});

console.log("Composed:", composed);

// 4. Format as Myanmar text
if (composed) {
  console.log("Myanmar format:", formatNRC(composed, "mm"));
}
```

Example values above illustrate the API shape. Always validate against the package's supported reference data and the applicable real-world format requirements.

## Command-Line Interface

Run the CLI using `npx`:

```bash
npx myanmar-nrc-validator "၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆"
```

The CLI reports whether the supplied NRC is valid, prints parsed components, and shows supported output formats. To display the available CLI options:

```bash
npx myanmar-nrc-validator --help
```

## Core API

### Validate an NRC

`validateNRC(value)` returns `true` when the value matches the package's supported NRC format and reference data; otherwise, it returns `false`.

```typescript
import { validateNRC } from "myanmar-nrc-validator";

console.log(validateNRC("12/UKAMA(N)123456"));
console.log(validateNRC("၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆"));
console.log(validateNRC("99/XXXXX(N)123456"));
```

Do not treat a `true` result as proof of document authenticity or identity.

### Parse NRC components

`parseNRC(value)` returns a parsed object for a supported value or `null` when the value is invalid or unsupported.

```typescript
import { parseNRC } from "myanmar-nrc-validator";

const parsed = parseNRC("12/UKAMA(N)123456");

if (parsed) {
  console.log(parsed.stateCode);   // "12"
  console.log(parsed.stateNameEn); // "Yangon Region"
  console.log(parsed.township);    // "UKAMA"
  console.log(parsed.type);        // "N"
  console.log(parsed.number);      // "123456"
} else {
  console.log("Invalid or unsupported NRC");
}
```

The `township` field contains the township string as it appears in the parsed NRC. To retrieve a canonical township record, use `getStateTownships()` and match against the returned township data. The MCP `parse_nrc` tool additionally returns the canonical `townshipCode`.

### Compose and format NRC values

Use `composeNRC()` to build an NRC string from its components. Use `formatNRC()` to format a supported NRC value.

```typescript
import { composeNRC, formatNRC } from "myanmar-nrc-validator";

const nrc = composeNRC({
  stateCode: "12",
  township: "UKAMA",
  type: "N",
  number: "123456",
});

if (nrc) {
  console.log(nrc);                    // "12/UKAMA(N)123456"
  console.log(formatNRC(nrc, "mm"));   // Myanmar representation
} else {
  console.log("Could not compose NRC from the supplied components");
}
```

`composeNRC()` and `formatNRC()` return `null` when the supplied components or NRC cannot be resolved.

### Work with states, townships, and citizen types

Get state/region and township data:

```typescript
import { getStates, getStateTownships } from "myanmar-nrc-validator";

const states = getStates();
console.log(states);

const yangon = getStateTownships("12");
console.log(yangon?.townships);
```

Search the returned township records in your application:

```typescript
import { getStates, getStateTownships } from "myanmar-nrc-validator";

const query = "ukama".toLocaleLowerCase();

const matches = getStates().flatMap((state) => {
  const region = getStateTownships(state.code);

  return (region?.townships ?? [])
    .filter((township) =>
      [
        township.en,
        township.mm,
        township.fullEn,
        township.fullMm,
        township.townshipCode,
      ].some((value) => value.toLocaleLowerCase().includes(query)),
    )
    .map((township) => ({
      ...township,
      stateCode: state.code,
      stateNameEn: state.en,
    }));
});

console.log(matches);
```

Township records include `townshipCode`, whose value matches `fullEn`. Use the returned fields rather than assuming a separate package-level township-search function exists.

Get citizen-type information:

```typescript
import {
  getCitizenTypes,
  getCitizenType,
  getStates,
} from "myanmar-nrc-validator";

console.log(getCitizenTypes());
console.log(getCitizenType("12/UKAMA(N)123456"));
console.log(getStates());
```

## TypeScript and Zod

The package provides TypeScript declarations and exports types including `ParsedNRC`, `ComposeOptions`, `CitizenType`, `ScanOptions`, and `BankGradeScanResult`.

### Validate with the exported schema

```typescript
import {
  nrcStringSchema,
  parseNRC,
  type ParsedNRC,
  type ComposeOptions,
} from "myanmar-nrc-validator";

const result = nrcStringSchema.safeParse("၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆");

if (result.success) {
  const acceptedNrc: string = result.data;
  console.log(acceptedNrc);
}

const parsed: ParsedNRC | null = parseNRC("12/UKAMA(N)123456");

const components: ComposeOptions = {
  stateCode: "12",
  township: "UKAMA",
  type: "N",
  number: "123456",
};
```

### Extend Zod strings

Use `extendZodWithNRC()` to add an `.nrc()` method to `ZodString` at runtime:

```typescript
import { z } from "zod";
import { extendZodWithNRC } from "myanmar-nrc-validator";

extendZodWithNRC();

const formSchema = z.object({
  nrc: z.string().nrc(),
});

const result = formSchema.safeParse({
  nrc: "၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆",
});

console.log(result.success);
```

Use `nrcStringSchema` when you want the package's exported schema directly. Use the extension helper when you specifically want the `.nrc()` method in a Zod string schema.

## OCR document scanning

The OCR scanner accepts an image path or a Node.js `Buffer`. It preprocesses images with Sharp and recognizes text with Tesseract.js.

### Scan an image

```typescript
import { readFile } from "node:fs/promises";
import { scanAndValidateNRCImage } from "myanmar-nrc-validator";

const image = await readFile("./nrc-front.jpg");

const result = await scanAndValidateNRCImage(image, {
  resizeWidth: 2200,
  grayscale: true,
  normalize: true,
  minConfidence: 60,
});

if (!result.success) {
  console.error("Scan failed:", result.error);
} else {
  console.log("Document type:", result.documentType);
  console.log("Extracted NRC:", result.extractedNRC);
  console.log("Confidence:", result.confidence);
  console.log("Manual review required:", result.requiresManualReview);
}
```

The exact output fields depend on the result type and scan path. Inspect the exported `BankGradeScanResult` type for the complete shape.

### Scanner utilities

| Function | Purpose |
| --- | --- |
| `scanAndValidateNRCImage(input, options?)` | Run an OCR scan and return extracted data and review flags. |
| `scanAndValidateWithRetry(input, options?)` | Retry scanning with adjusted preprocessing options. |
| `scanWithCache(input, options?)` | Reuse cached OCR results for the same image and options. |
| `clearOCRCache()` | Clear cached OCR results. |
| `detectDocumentType(text)` | Classify OCR text as an NRC or driving-licence front/back. |
| `extractAndCleanNRC(text)` | Extract and clean an NRC string from OCR text. |
| `extractAndCleanLicense(text)` | Extract a licence number and serial number from OCR text. |
| `normalizeDigits(text)` | Convert Myanmar numerals in text to ASCII digits. |

### OCR review guidance

OCR is probabilistic. Image quality, glare, rotation, blur, fonts, and document condition can affect extraction and confidence.

Recommended workflow:

1. Capture a clear, well-lit image with the document fully visible.
2. Run the scan and check whether it succeeded.
3. Review the extracted values, document type, and confidence.
4. Treat low-confidence, unknown, or flagged results as requiring human review.
5. Verify sensitive information using an appropriate trusted process before acting on it.

A high OCR confidence score does not establish that the document is authentic or that the extracted identity is correct. Do not use OCR alone as the basis for consequential identity decisions.

## Model Context Protocol (MCP) Server

The repository includes a local stdio MCP server at `src/mcp-server.ts`. It exposes supported package functions as tools for MCP-compatible applications. The documented workflow runs the server from a local source checkout; the server is not published as a separate npm executable.

### Run locally

```bash
git clone https://github.com/aungphyoekhant/myanmar-nrc-validator.git
cd myanmar-nrc-validator
npm install
npm run mcp:dev
```

You can also run the server directly:

```bash
npx tsx src/mcp-server.ts
```

Keep the server process available while the MCP client is connected. In the configurations below, replace `/absolute/path/to/myanmar-nrc-validator` with the absolute path to your local repository. The `npm` command must be available on the client's `PATH`.

### Claude Desktop configuration

Add the following entry to the `mcpServers` object in your Claude Desktop configuration file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "myanmar-nrc-validator": {
      "command": "npm",
      "args": [
        "--prefix",
        "/absolute/path/to/myanmar-nrc-validator",
        "run",
        "mcp:dev"
      ]
    }
  }
}
```

Save the configuration and restart Claude Desktop. For current client-specific instructions, consult the [Anthropic MCP documentation](https://docs.anthropic.com/en/docs/claude-code/mcp).

### Cursor configuration

Create `.cursor/mcp.json` in your project, or add the server to the appropriate user-level Cursor MCP configuration:

```json
{
  "mcpServers": {
    "myanmar-nrc-validator": {
      "command": "npm",
      "args": [
        "--prefix",
        "/absolute/path/to/myanmar-nrc-validator",
        "run",
        "mcp:dev"
      ]
    }
  }
}
```

Reload Cursor or restart the MCP server from Cursor's MCP settings. Configuration locations can change, so refer to the [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol) for current instructions.

### Available MCP tools

| Tool | Description |
| --- | --- |
| `validate_nrc` | Validate an NRC string. |
| `is_valid_township` | Check a township against a state/region. |
| `parse_nrc` | Parse NRC components and return the canonical `townshipCode`. |
| `get_states` | Return supported states and regions. |
| `get_townships` | List townships, optionally filtered by state and query. |
| `search_townships` | Search township names and codes across regions. |
| `get_state_townships` | Return region metadata and its township list. |
| `get_citizen_types` | Return citizen-type codes and labels. |
| `get_citizen_type` | Extract a citizen type or list all types. |
| `compose_nrc` | Compose an NRC from its components. |
| `format_nrc` | Format an NRC in English or Myanmar. |
| `validate_nrc_schema` | Validate an NRC with the exported Zod schema. |
| `extend_zod_with_nrc` | Apply the Zod string extension. |
| `get_data_catalog` | Return state and citizenship data constants. |
| `normalize_digits` | Convert Myanmar numerals to ASCII digits. |
| `detect_document_type` | Classify OCR text by document type. |
| `extract_and_clean_nrc` | Extract and clean an NRC from OCR text. |
| `extract_and_clean_license` | Extract licence and serial numbers from OCR text. |
| `scan_nrc_image` | OCR-scan a base64-encoded image. |
| `scan_nrc_image_with_retry` | OCR-scan an image using the retry workflow. |
| `scan_nrc_image_with_cache` | OCR-scan an image using the option-sensitive cache. |
| `clear_ocr_cache` | Clear cached OCR results. |

MCP image tools accept an `imageBase64` argument containing base64-encoded image data or a data URL. The documented input limit is **15 MiB**. Optional scan parameters include `resizeWidth`, `grayscale`, `normalize`, `contrastMultiplier`, `rotateDegrees`, `minConfidence`, and other supported `ScanOptions` fields.

## API Reference

This table summarizes the main documented exports. Check the package's TypeScript declarations for exact parameter and return types.

| Export | Description |
| --- | --- |
| `validateNRC`, `isValidTownship` | Validate NRC strings and township membership. |
| `parseNRC`, `getCitizenType`, `getCitizenTypes` | Parse NRC values and retrieve citizen-type information. |
| `getStates`, `getStateTownships` | Retrieve state/region and township data. |
| `composeNRC`, `formatNRC` | Build and format NRC strings. |
| `nrcStringSchema`, `extendZodWithNRC` | Zod schema and extension helper. |
| `scanAndValidateNRCImage`, `scanAndValidateWithRetry`, `scanWithCache`, `clearOCRCache` | OCR scanning, retry, and cache utilities. |
| `detectDocumentType`, `extractAndCleanNRC`, `extractAndCleanLicense`, `normalizeDigits` | OCR text-processing helpers. |
| `STATE_REGIONS`, `CITIZENSHIP_TYPES` | Raw reference-data constants. |

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/aungphyoekhant/myanmar-nrc-validator.git
cd myanmar-nrc-validator
npm install
```

Build the project:

```bash
npm run build
```

Run the local MCP server during development:

```bash
npm run mcp:dev
```

The project is TypeScript-first and emits ESM JavaScript and declaration files into `dist/`. Available scripts can be inspected in `package.json`:

```bash
npm run
```

Before publishing a release, verify the build, test the documented examples, and ensure that package exports and README examples match the code being released.

## Troubleshooting

### The CLI command is not found

Try running it through `npx`:

```bash
npx myanmar-nrc-validator --help
```

### `parseNRC()` returns `null`

The input may be invalid or outside the package's supported format/reference data. Check the input string and call `validateNRC()` before using the parsed result.

### `composeNRC()` returns `null`

Check that the state/region code, township, citizen type, and number are supported and correctly supplied.

### OCR returns an unknown document type or needs manual review

Try a sharper, well-lit, front-facing image with less glare and blur. Check the extracted text and review flags. OCR results may still need manual correction.

### The MCP server does not appear in the client

- Confirm that dependencies are installed in the local checkout.
- Replace the sample repository path with the correct absolute path.
- Confirm that `npm` is available to the MCP client's process.
- Restart or reload the client after editing its configuration.
- Review the client's MCP logs for startup or configuration errors.

## Security and Privacy

NRC numbers and identity-document images are sensitive personal information. Applications using this package should:

- Collect and process only the information needed for a legitimate purpose.
- Avoid logging full NRC numbers, document images, or extracted identity data.
- Protect temporary files and cached OCR results with appropriate access controls.
- Define retention and deletion rules for images and extracted data.
- Restrict access to OCR results and review workflows.
- Obtain appropriate consent and comply with applicable privacy and data-protection requirements.
- Avoid treating format validation or OCR output as proof of identity or authenticity.

Review how your application handles files, logs, and caching before processing real identity documents. This package's README does not make a claim that all application data is automatically encrypted or deleted.

## Contributing

Contributions, bug reports, and documentation improvements are welcome.

Before opening a pull request:

1. Create a focused branch for your change.
2. Keep the change scoped and explain its motivation.
3. Add or update tests for behavior changes when a test suite is available.
4. Update documentation when public APIs or behavior change.
5. Run the project build:

   ```bash
   npm run build
   ```

6. Include relevant examples and compatibility notes in the pull request description.

For bugs and feature requests, open an issue in the [GitHub repository](https://github.com/aungphyoekhant/myanmar-nrc-validator).

## License

The project metadata declares this package as **MIT licensed**. Review the repository's `LICENSE` file to confirm the terms that apply to the version you use.

## Support

- **Issues and feature requests:** [GitHub Issues](https://github.com/aungphyoekhant/myanmar-nrc-validator/issues)
- **Source code:** [GitHub repository](https://github.com/aungphyoekhant/myanmar-nrc-validator)
- **Package:** [npm — myanmar-nrc-validator](https://www.npmjs.com/package/myanmar-nrc-validator)

---

## DEVELOPER README
-- This README is for developers only. For end-users, see the [README.md](https://github.com/aungphyoekhant/myanmar-nrc-validator/blob/main/README.md) file.

---
## DEVELOPER NAME

Aung Phyo Khant

## DEVELOPER CONTACT

GitHub: [aungphyoekhant](https://github.com/aungphyoekhant)

Email: [aungphyokhant@gmail.com](mailto:aungphyokhant@gmail.com)

<div align="center">

**Built for developers working with Myanmar NRC data. 🇲🇲**

If this package is useful to your project, consider starring the repository and sharing feedback through GitHub Issues.

</div>
