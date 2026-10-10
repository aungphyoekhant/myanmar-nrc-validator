# myanmar-nrc-validator 🇲🇲

A comprehensive, robust, and lightweight TypeScript/JavaScript library for validating, parsing, formatting, composing, and working with Myanmar National Registration Card (NRC) numbers.

The library supports both **English and Myanmar text formats**, provides utilities for Myanmar states/regions, townships, and citizen types, includes **Zod schemas** for application-level validation, and comes with a convenient **CLI**.

> Built for Node.js, TypeScript, JavaScript, NestJS, Express, React, and other modern JavaScript applications.

---

## ✨ Features

* **Validation** — Validate complete Myanmar NRC numbers, state codes, township codes, citizen types, and ID numbers.
* **Parsing** — Extract structured NRC information such as state number, township code, citizen type, and ID number.
* **Formatting** — Convert NRC values between Myanmar and English formats.
* **Composition** — Build NRC strings programmatically with `composeNRC`.
* **State & Township Utilities** — Retrieve Myanmar states/regions and their corresponding townships.
* **Citizen Type Utilities** — Work with citizen type codes and Myanmar/English labels.
* **Zod Integration** — Use built-in Zod schemas with NestJS, Express, React Hook Form, and other applications.
* **CLI Support** — Validate and parse NRC numbers directly from the terminal.
* **TypeScript Support** — Includes TypeScript types and declarations.
* **Lightweight** — Designed with a minimal dependency footprint.

---

## 📦 Installation

Install the package from npm:

```bash
npm install myanmar-nrc-validator
```

---

## 💻 CLI Usage

You can validate and parse NRC numbers directly from your terminal.

### English NRC

```bash
npx myanmar-nrc-validator "12/UKAMA(N)123456"
```

### Myanmar NRC

```bash
npx nrc "၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆"
```

---

# 🚀 Programmatic Usage

Import the utilities you need from `myanmar-nrc-validator`.

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
} from "myanmar-nrc-validator";
```

---

## 1. Validate NRC

Use `validateNRC` to check whether an NRC number is valid.

```typescript
import { validateNRC } from "myanmar-nrc-validator";

console.log(validateNRC("၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆"));
// true

console.log(validateNRC("12/UKAMA(N)123456"));
// true

console.log(validateNRC("99/XYZ(N)123456"));
// false
```

The validator checks the NRC structure and validates the relevant state/township information.

---

## 2. Parse NRC

Use `parseNRC` to extract structured information from an NRC string.

```typescript
import { parseNRC } from "myanmar-nrc-validator";

const result = parseNRC("၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆");

console.log(result);
```

Example output:

```typescript
{
  stateNumber: "12",
  townshipCode: "ဥကမ",
  citizenType: "နိုင်",
  number: "၁၂၃၄၅၆"
}
```

For English input:

```typescript
const result = parseNRC("12/UKAMA(N)123456");

console.log(result);
```

The parser normalizes the NRC components into a structured object that can be used easily in application code.

---

## 3. Get Citizen Type

`getCitizenType` can be used to extract the citizen type from an NRC.

```typescript
import { getCitizenType } from "myanmar-nrc-validator";

const citizenType = getCitizenType("12/UKAMA(N)123456");

console.log(citizenType);
```

Example:

```text
နိုင်
```

The helper also supports retrieving the complete citizen-type list when called without an argument:

```typescript
const allCitizenTypes = getCitizenType();

console.log(allCitizenTypes);
```

Example:

```typescript
[
  {
    code: "N",
    en: "Citizen",
    mm: "နိုင်"
  },
  {
    code: "E",
    en: "Associate Citizen",
    mm: "ဧည့်"
  },
  {
    code: "P",
    en: "Naturalized Citizen",
    mm: "ပြု"
  }
]
```

> The exact available citizen types depend on the library's built-in NRC data.

---

## 4. Format NRC

Use `formatNRC` to convert between Myanmar and English NRC formats.

### Myanmar → English

```typescript
import { formatNRC } from "myanmar-nrc-validator";

console.log(
  formatNRC("၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆", "en")
);
```

Output:

```text
12/UKAMA(N)123456
```

### English → Myanmar

```typescript
console.log(
  formatNRC("12/UKAMA(N)123456", "mm")
);
```

Output:

```text
၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆
```

---

## 5. Get States / Regions

Retrieve the built-in Myanmar state and region data.

```typescript
import { getStates } from "myanmar-nrc-validator";

const states = getStates();

console.log(states);
```

This provides access to Myanmar NRC state/region information used by the validator.

---

## 6. Get Townships for a State

Use `getStateTownships` to retrieve townships associated with a state or region.

```typescript
import { getStateTownships } from "myanmar-nrc-validator";

const townships = getStateTownships("12");

console.log(townships);
```

For example, `"12"` represents the Yangon NRC state/region number.

---

## 7. Get Citizen Types

Retrieve all available citizen types.

```typescript
import { getCitizenTypes } from "myanmar-nrc-validator";

const citizenTypes = getCitizenTypes();

console.log(citizenTypes);
```

Example:

```typescript
[
  {
    code: "N",
    en: "Citizen",
    mm: "နိုင်"
  },
  {
    code: "E",
    en: "Associate Citizen",
    mm: "ဧည့်"
  },
  {
    code: "P",
    en: "Naturalized Citizen",
    mm: "ပြု"
  }
]
```

---

# 🧩 Compose NRC

Use `composeNRC` to construct an NRC number from individual components.

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

Output:

```text
၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆
```

English format:

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

Output:

```text
12/UKAMA(N)123456
```

---

# 🛡️ Zod Schema Validation

The package provides a built-in Zod schema for validating NRC strings in application forms and APIs.

```typescript
import { nrcStringSchema } from "myanmar-nrc-validator";

const validationResult = nrcStringSchema.safeParse(
  "၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆"
);

if (validationResult.success) {
  console.log("Valid NRC!");
} else {
  console.log(
    "Validation failed:",
    validationResult.error.format()
  );
}
```

---

# 🏗️ Data Model

The logical NRC data model can be represented as:

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
└────────┬─────────┘
         │
         │
         ▼
┌──────────────────┐
│    NRC Record    │
├──────────────────┤
│ stateNumber      │
│ townshipCode     │
│ citizenType      │
│ number           │
└────────┬─────────┘
         │
         │ N : 1
         ▼
┌──────────────────┐
│  Citizen Types   │
├──────────────────┤
│ code             │
│ en               │
│ mm               │
└──────────────────┘
```

An NRC string follows this logical structure:

```text
12 / UKAMA ( N ) 123456
│     │      │       │
│     │      │       └── NRC ID Number
│     │      └────────── Citizen Type
│     └───────────────── Township Code
└─────────────────────── State / Region Number
```

Myanmar format:

```text
၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆
```

English format:

```text
12/UKAMA(N)123456
```

---

# 🔄 Library Flow

```text
                  ┌───────────────────────┐
                  │   Application / CLI   │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ myanmar-nrc-validator │
                  └───────────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
     ┌─────────┐         ┌─────────┐         ┌─────────┐
     │ Validate│         │  Parse  │         │ Format  │
     └─────────┘         └─────────┘         └─────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                  ┌───────────────────────┐
                  │ NRC Data / Utilities  │
                  ├───────────────────────┤
                  │ States                │
                  │ Townships             │
                  │ Citizen Types         │
                  └───────────────────────┘
```

---

# 🌐 Supported Use Cases

The package can be used in:

* **NestJS APIs**
* **Express.js APIs**
* **React applications**
* **React Hook Form**
* **Node.js applications**
* **TypeScript projects**
* **JavaScript projects**
* **CLI tools**
* **Database/API input validation**
* **Registration and identity forms**

Example architecture:

```text
React / Web Form
       │
       ▼
nrcStringSchema
       │
       ▼
NestJS / Express API
       │
       ▼
validateNRC()
       │
       ▼
parseNRC()
       │
       ▼
Application Database
```

---

# 🧪 Real-World Example

```typescript
import {
  validateNRC,
  parseNRC,
  formatNRC,
} from "myanmar-nrc-validator";

const input = "12/UKAMA(N)123456";

if (!validateNRC(input)) {
  throw new Error("Invalid NRC number");
}

const parsed = parseNRC(input);

console.log(parsed);

console.log(
  formatNRC(input, "mm")
);
```

Example result:

```typescript
{
  stateNumber: "12",
  townshipCode: "UKAMA",
  citizenType: "N",
  number: "123456"
}
```

Formatted Myanmar NRC:

```text
၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆
```

---

# 📚 API Overview

| Function              | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `validateNRC()`       | Validate an NRC string                      |
| `parseNRC()`          | Parse NRC into structured data              |
| `formatNRC()`         | Convert between English and Myanmar formats |
| `composeNRC()`        | Construct an NRC from components            |
| `getStates()`         | Get state/region data                       |
| `getStateTownships()` | Get townships for a state/region            |
| `getCitizenTypes()`   | Get all citizen types                       |
| `getCitizenType()`    | Get a citizen type or the complete list     |
| `nrcStringSchema`     | Zod NRC validation schema                   |

---

# 📋 NRC Structure

A standard NRC value is composed of:

| Component     | Example  | Description             |
| ------------- | -------- | ----------------------- |
| State Number  | `12`     | NRC state/region number |
| Township Code | `UKAMA`  | Township identifier     |
| Citizen Type  | `N`      | Citizen category        |
| ID Number     | `123456` | Six-digit NRC number    |

English:

```text
12/UKAMA(N)123456
```

Myanmar:

```text
၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆
```

---

# 🧑‍💻 TypeScript Example

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
```

---

# 📁 Suggested Project Structure

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
│   ├── compose.ts
│   ├── index.ts
│   └── cli.ts
│
├── tests/
│   ├── validate.test.ts
│   ├── parse.test.ts
│   ├── format.test.ts
│   └── compose.test.ts
│
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```

---

# 🤝 Contributing

Contributions, bug reports, improvements, and additional NRC data are welcome.

When contributing:

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

---

# 📄 License

MIT License © **Aung Phyo Khant**

See the `LICENSE` file for the complete license text.

---

## ⭐ Support

If this package is useful to you, consider giving the repository a ⭐ on GitHub.

Made with ❤️ for Myanmar developers.
