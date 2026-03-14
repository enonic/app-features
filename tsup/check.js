const { execSync } = require("child_process");
const { globSync } = require("glob");
const process = require("process");
const path = require("path");

const dir = process.argv[2];
const excludeDir = process.argv[3]; // optional

if (!dir) {
  console.error("Usage: node tsup/check.js <dir> [excludeDir]");
  process.exit(1);
}

const pattern = path.join(dir, "**/*.ts");
const excludePattern = excludeDir ? path.join(excludeDir, "**/*.ts") : null;

// Get all matching .ts files
let files = globSync(pattern, { nodir: true });

// Exclude any in the excluded directory
if (excludePattern) {
  const excluded = new Set(globSync(excludePattern, { nodir: true }));
  files = files.filter(f => !excluded.has(f));
}

if (files.length === 0) {
  console.log(`No TypeScript files found in ${dir}${excludeDir ? ` (excluding ${excludeDir})` : ""}. Skipping type check.`);
  process.exit(0);
}

// Build path to tsconfig.json
const tsconfigPath = path.join(dir, "tsconfig.json");

try {
  console.log(`Running type check in ${dir}${excludeDir ? ` (excluding ${excludeDir})` : ""}...`);
  execSync(`npx tsc --noEmit -p "${tsconfigPath}"`, { stdio: "inherit" });
} catch {
  process.exit(1);
}
