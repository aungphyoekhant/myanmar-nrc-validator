#!/usr/bin/env node
import { validateNRC } from "./utils/validator.js";
import { parseNRC } from "./utils/parser.js";
import { formatNRC } from "./utils/formatter.js";

const args = process.argv.slice(2);
const input = args[0];

if (!input || input === "--help" || input === "-h") {
  console.log(`
  Usage: npx myanmar-nrc-validator "<NRC_STRING>"
  
  Example:
    npx myanmar-nrc-validator "၁၂/ဥကမ(နိုင်)၁၂၃၄၅၆"
  `);
  process.exit(0);
}

console.log(`\n🔍 Checking NRC: "${input}"\n`);

const isValid = validateNRC(input);
if (!isValid) {
  console.error("❌ Result: Invalid Myanmar NRC format!");
  process.exit(1);
}

console.log("✅ Result: Valid Myanmar NRC!");
const parsed = parseNRC(input);
if (parsed) {
  console.log("\n📋 Parsed Details:");
  console.log(JSON.stringify(parsed, null, 2));

  console.log("\n🔄 Formats:");
  console.log(`- English Format: ${formatNRC(input, "en")}`);
  console.log(`- Myanmar Format: ${formatNRC(input, "mm")}`);
}

export {};
