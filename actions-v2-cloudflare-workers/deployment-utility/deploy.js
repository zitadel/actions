import { execSync } from "child_process";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env
const envPath = path.resolve(".env");
if (!fs.existsSync(envPath)) {
  console.error("ERROR: .env file not found");
  process.exit(1);
}

const envConfig = dotenv.config({ path: envPath }).parsed;
if (!envConfig) {
  console.error("ERROR: Failed to parse .env file");
  process.exit(1);
}

const scriptName = process.argv[2];
if (!scriptName) {
  console.error("Usage: npm start <script-name>");
  process.exit(1);
}

const scriptPath = path.resolve(`../scripts/${scriptName}`);
console.log(`🚀 Deploying script from folder: ${scriptPath}`);

// Ensure required Cloudflare variables are present
if (!envConfig.CLOUDFLARE_API_TOKEN || !envConfig.CLOUDFLARE_ACCOUNT_ID) {
  console.error("ERROR: CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID missing in .env");
  process.exit(1);
}

// Only upload secrets defined in .env that do NOT start with "CLOUDFLARE"
const secretsToUpload = Object.keys(envConfig).filter((k) => !k.startsWith("CLOUDFLARE"));

const execOptions = {
  stdio: "inherit",
  cwd: scriptPath, // ensures wrangler.toml in the script folder is used
  env: {
    ...process.env,
    ...envConfig,
    CLOUDFLARE_ACCOUNT_ID: envConfig.CLOUDFLARE_ACCOUNT_ID,
  },
};

// Upload each secret
for (const key of secretsToUpload) {
  try {
    console.log(`🔑 Syncing secret: ${key}`);
    execSync(`echo "${envConfig[key]}" | npx wrangler secret put ${key}`, execOptions);
    console.log(`✅ Secret '${key}' synced successfully`);
  } catch (err) {
    console.error(`❌ ERROR: Failed to sync secret ${key}`, err);
  }
}

// Deploy the worker
try {
  console.log("🌀 Deploying to Cloudflare Workers...");
  execSync("npx wrangler deploy", execOptions);
  console.log("✨ Deployment complete!");
} catch (err) {
  console.error("❌ ERROR: Deployment failed", err);
}
