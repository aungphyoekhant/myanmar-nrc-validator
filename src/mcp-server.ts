import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  CITIZENSHIP_TYPES,
  STATE_REGIONS,
  clearOCRCache,
  composeNRC,
  detectDocumentType,
  extendZodWithNRC,
  extractAndCleanLicense,
  extractAndCleanNRC,
  formatNRC,
  getCitizenType,
  getCitizenTypes,
  getStateTownships,
  getStates,
  isValidTownship,
  normalizeDigits,
  nrcStringSchema,
  parseNRC,
  scanAndValidateNRCImage,
  scanAndValidateWithRetry,
  scanWithCache,
  validateNRC,
} from "./index.js";
import type { ScanOptions } from "./index.js";

type JsonSchema = Record<string, unknown>;
type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  run: (args: Record<string, unknown>) => unknown | Promise<unknown>;
};

const emptySchema: JsonSchema = { type: "object", properties: {}, additionalProperties: false };
const stringProperty = (description: string) => ({ type: "string", description });
const objectSchema = (
  properties: Record<string, unknown>,
  required: string[] = [],
): JsonSchema => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

function requiredString(args: Record<string, unknown>, name: string): string {
  const value = args[name];
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`Argument "${name}" must be a non-empty string.`);
  }
  return value.trim();
}

function optionalScanOptions(args: Record<string, unknown>): ScanOptions {
  const expectedTypes: Record<string, "number" | "boolean" | "string"> = {
    resizeWidth: "number", zoomScale: "number", grayscale: "boolean", normalize: "boolean",
    median: "number", contrastMultiplier: "number", brightnessOffset: "number",
    sharpenSigma: "number", rotateDegrees: "number", useThreshold: "boolean",
    thresholdValue: "number", minConfidence: "number", smartCoreApproval: "boolean",
    debug: "boolean", debugOutputPath: "string",
  };
  const options: Record<string, unknown> = {};
  for (const [key, expectedType] of Object.entries(expectedTypes)) {
    if (args[key] === undefined) continue;
    if (typeof args[key] !== expectedType || (expectedType === "number" && !Number.isFinite(args[key]))) {
      throw new TypeError(`Argument "${key}" must be ${expectedType === "number" ? "a finite number" : `a ${expectedType}`}.`);
    }
    options[key] = args[key];
  }
  return options as ScanOptions;
}

function imageBuffer(args: Record<string, unknown>): Buffer {
  const encoded = requiredString(args, "imageBase64").replace(/^data:[^,]+,/, "");
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) {
    throw new TypeError('Argument "imageBase64" must contain valid base64 image data.');
  }
  const buffer = Buffer.from(encoded, "base64");
  if (buffer.length === 0 || buffer.length > 15 * 1024 * 1024) {
    throw new RangeError("Image data must be between 1 byte and 15 MiB.");
  }
  return buffer;
}

const scanProperties = {
  imageBase64: stringProperty("Image bytes encoded as base64; data URLs are also accepted."),
  resizeWidth: { type: "number" }, zoomScale: { type: "number" },
  grayscale: { type: "boolean" }, normalize: { type: "boolean" },
  median: { type: "number" }, contrastMultiplier: { type: "number" },
  brightnessOffset: { type: "number" }, sharpenSigma: { type: "number" },
  rotateDegrees: { type: "number" }, useThreshold: { type: "boolean" },
  thresholdValue: { type: "number" }, minConfidence: { type: "number" },
  smartCoreApproval: { type: "boolean" }, debug: { type: "boolean" },
  debugOutputPath: { type: "string" },
};

const tools: ToolDefinition[] = [
  {
    name: "validate_nrc", description: "Check whether an NRC string matches supported formats and township data.",
    inputSchema: objectSchema({ nrc: stringProperty("NRC string to validate.") }, ["nrc"]),
    run: (args) => validateNRC(requiredString(args, "nrc")),
  },
  {
    name: "is_valid_township", description: "Check whether a township name/code belongs to a state or region.",
    inputSchema: objectSchema({ stateCode: stringProperty("NRC state/region code."), township: stringProperty("Township name or code.") }, ["stateCode", "township"]),
    run: (args) => isValidTownship(requiredString(args, "stateCode"), requiredString(args, "township")),
  },
  {
    name: "parse_nrc", description: "Parse an NRC string, including the canonical townshipCode from township data.",
    inputSchema: objectSchema({ nrc: stringProperty("NRC string to parse.") }, ["nrc"]),
    run: (args) => {
      const result = parseNRC(requiredString(args, "nrc"));
      if (!result) throw new RangeError("The NRC string is invalid or uses an unsupported state, township, or citizen type.");
      const township = getStateTownships(result.stateCode)?.townships.find((item) =>
        [item.en, item.mm, item.fullEn, item.fullMm, item.townshipCode]
          .some((value) => value.toLocaleUpperCase() === result.township.toLocaleUpperCase()),
      );
      return { ...result, townshipCode: township?.townshipCode ?? result.township };
    },
  },
  {
    name: "get_states", description: "Retrieve the supported states and regions.",
    inputSchema: emptySchema, run: () => getStates(),
  },
  {
    name: "get_townships", description: "Retrieve townships, optionally filtered by state/region and a name query. Every result includes townshipCode.",
    inputSchema: objectSchema({ stateCode: { type: ["string", "number"], description: "Optional NRC state/region code." }, query: stringProperty("Optional case-insensitive search across township names and codes.") }),
    run: (args) => {
      const stateCode = args.stateCode;
      if (stateCode !== undefined && typeof stateCode !== "string" && typeof stateCode !== "number") {
        throw new TypeError('Argument "stateCode" must be a string or number.');
      }
      if (args.query !== undefined && typeof args.query !== "string") {
        throw new TypeError('Argument "query" must be a string.');
      }
      const states = stateCode === undefined ? getStates() : getStates().filter((state) => state.code === String(stateCode));
      if (stateCode !== undefined && states.length === 0) throw new RangeError(`Unknown state/region code: ${stateCode}`);
      const query = (args.query as string | undefined)?.trim().toLocaleLowerCase();
      return states.flatMap((state) => {
        const data = getStateTownships(state.code);
        return (data?.townships ?? [])
          .filter((township) => !query || [township.en, township.mm, township.fullEn, township.fullMm, township.townshipCode]
            .some((value) => value.toLocaleLowerCase().includes(query)))
          .map((township) => ({ ...township, stateCode: state.code, stateNameEn: state.en, stateNameMm: state.mm }));
      });
    },
  },
  {
    name: "search_townships", description: "Search supported township names and codes across all states/regions.",
    inputSchema: objectSchema({ query: stringProperty("Text to search for.") }, ["query"]),
    run: (args) => {
      const query = requiredString(args, "query");
      return tools.find((tool) => tool.name === "get_townships")!.run({ query });
    },
  },
  {
    name: "get_state_townships", description: "Retrieve state metadata and all townships for one state/region.",
    inputSchema: objectSchema({ stateCode: { type: ["string", "number"], description: "NRC state/region code." } }, ["stateCode"]),
    run: (args) => {
      const code = args.stateCode;
      if (typeof code !== "string" && typeof code !== "number") throw new TypeError('Argument "stateCode" must be a string or number.');
      const result = getStateTownships(code);
      if (!result) throw new RangeError(`Unknown state/region code: ${code}`);
      return result;
    },
  },
  {
    name: "get_citizen_types", description: "Retrieve all supported citizen type codes and labels.",
    inputSchema: emptySchema, run: () => getCitizenTypes(),
  },
  {
    name: "get_citizen_type", description: "Extract the citizen type from an NRC, or list all types when no NRC is provided.",
    inputSchema: objectSchema({ nrc: stringProperty("Optional NRC string.") }),
    run: (args) => {
      if (args.nrc === undefined) return getCitizenType();
      const result = getCitizenType(requiredString(args, "nrc"));
      if (result === null) throw new RangeError("No citizen type was found in the NRC string.");
      return result;
    },
  },
  {
    name: "compose_nrc", description: "Compose an NRC from state, township, citizen type, and six-digit number.",
    inputSchema: objectSchema({ stateCode: { type: ["string", "number"] }, township: stringProperty("Township name/code."), type: stringProperty("Citizen type code or Myanmar label."), number: { type: ["string", "number"] } }, ["stateCode", "township", "type", "number"]),
    run: (args) => {
      if ((typeof args.stateCode !== "string" && typeof args.stateCode !== "number") || (typeof args.number !== "string" && typeof args.number !== "number")) {
        throw new TypeError('Arguments "stateCode" and "number" must be strings or numbers.');
      }
      const result = composeNRC({ stateCode: args.stateCode, township: requiredString(args, "township"), type: requiredString(args, "type") as Parameters<typeof composeNRC>[0]["type"], number: args.number });
      if (!result) throw new RangeError("The supplied NRC components are not valid.");
      return result;
    },
  },
  {
    name: "format_nrc", description: "Format a valid NRC in English or Myanmar representation.",
    inputSchema: objectSchema({ nrc: stringProperty("NRC string."), target: { type: "string", enum: ["en", "mm"] } }, ["nrc", "target"]),
    run: (args) => {
      if (args.target !== "en" && args.target !== "mm") throw new TypeError('Argument "target" must be "en" or "mm".');
      const result = formatNRC(requiredString(args, "nrc"), args.target);
      if (!result) throw new RangeError("The NRC could not be parsed or formatted.");
      return result;
    },
  },
  {
    name: "validate_nrc_schema", description: "Validate an NRC string using the exported Zod nrcStringSchema.",
    inputSchema: objectSchema({ nrc: stringProperty("NRC string to validate.") }, ["nrc"]),
    run: (args) => {
      const result = nrcStringSchema.safeParse(requiredString(args, "nrc"));
      return result.success ? { success: true, data: result.data } : { success: false, error: result.error.issues };
    },
  },
  {
    name: "extend_zod_with_nrc", description: "Apply the package's extendZodWithNRC helper to the installed Zod instance.",
    inputSchema: emptySchema,
    run: () => { extendZodWithNRC(); return { success: true, message: "NRC validation extension registered on ZodString." }; },
  },
  {
    name: "get_data_catalog", description: "Retrieve the exported state and citizenship data constants.",
    inputSchema: emptySchema, run: () => ({ STATE_REGIONS, CITIZENSHIP_TYPES }),
  },
  {
    name: "normalize_digits", description: "Convert Myanmar numerals in text to ASCII digits.",
    inputSchema: objectSchema({ text: stringProperty("Text to normalize.") }, ["text"]),
    run: (args) => normalizeDigits(requiredString(args, "text")),
  },
  {
    name: "detect_document_type", description: "Classify OCR text as an NRC/licence front or back, or unknown.",
    inputSchema: objectSchema({ text: stringProperty("OCR text to classify.") }, ["text"]),
    run: (args) => detectDocumentType(requiredString(args, "text")),
  },
  {
    name: "extract_and_clean_nrc", description: "Extract and normalize an NRC from OCR text.",
    inputSchema: objectSchema({ text: stringProperty("OCR text.") }, ["text"]),
    run: (args) => extractAndCleanNRC(requiredString(args, "text")),
  },
  {
    name: "extract_and_clean_license", description: "Extract licence and serial numbers from OCR text.",
    inputSchema: objectSchema({ text: stringProperty("OCR text.") }, ["text"]),
    run: (args) => extractAndCleanLicense(requiredString(args, "text")),
  },
  {
    name: "scan_nrc_image", description: "OCR-scan an image buffer and validate the detected NRC/document.",
    inputSchema: objectSchema(scanProperties, ["imageBase64"]),
    run: (args) => scanAndValidateNRCImage(imageBuffer(args), optionalScanOptions(args)),
  },
  {
    name: "scan_nrc_image_with_retry", description: "OCR-scan an image with the package retry workflow.",
    inputSchema: objectSchema(scanProperties, ["imageBase64"]),
    run: (args) => scanAndValidateWithRetry(imageBuffer(args), optionalScanOptions(args)),
  },
  {
    name: "scan_nrc_image_with_cache", description: "OCR-scan an image using the option-sensitive result cache.",
    inputSchema: objectSchema(scanProperties, ["imageBase64"]),
    run: (args) => scanWithCache(imageBuffer(args), optionalScanOptions(args)),
  },
  {
    name: "clear_ocr_cache", description: "Clear all cached OCR scan results.",
    inputSchema: emptySchema, run: () => { clearOCRCache(); return { success: true }; },
  },
];

const server = new Server(
  { name: "myanmar-nrc-validator", version: "1.1.01" },
  { capabilities: { tools: {} } },
);

// The stdio transport owns stdout; route package diagnostics away from the JSON-RPC stream.
console.log = (...values: unknown[]) => console.error(...values);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = tools.find((item) => item.name === request.params.name);
  if (!tool) throw new Error(`Unknown tool: ${request.params.name}`);
  try {
    const result = await tool.run((request.params.arguments ?? {}) as Record<string, unknown>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) ?? "null" }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text: JSON.stringify({ error: message }) }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
