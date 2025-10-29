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
  console.error("ERROR: No script folder name provided");
  console.error("USAGE: npm start <script-folder-name> for example: npm start custom-claims");
  process.exit(1);
}

const scriptPath = path.resolve(`../scripts/${scriptName}`);

// Validate that the script path exists and is a directory
if (!fs.existsSync(scriptPath) || !fs.lstatSync(scriptPath).isDirectory()) {
  console.error(`ERROR: Script folder "${scriptPath}" does not exist or is not a directory`);
  process.exit(1);
}

// Ensure required Cloudflare variables are present
if (!envConfig.CLOUDFLARE_API_TOKEN || !envConfig.CLOUDFLARE_ACCOUNT_ID) {
  console.error("ERROR: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set in .env");
  process.exit(1);
}

console.log(`Deploying Script from folder: ${scriptPath}`);

const secretsToUpload = Object.keys(envConfig).filter((k) => !k.startsWith("CLOUDFLARE_"));

const execOptions = {
  stdio: "inherit",
  cwd: scriptPath,
  env: {
    ...process.env,
    ...envConfig,
    CLOUDFLARE_ACCOUNT_ID: envConfig.CLOUDFLARE_ACCOUNT_ID,
  },
};

// Upload each secret
for (const key of secretsToUpload) {
  try {
    execSync(`echo "${envConfig[key]}" | npx wrangler secret put ${key}`, execOptions);
    console.log(`'${key}' secret successfully loaded`);
  } catch (err) {
    console.error(`ERROR: Failed to load secret ${key}`, err);
  }
}

// Deploy the worker
try {
  execSync("npx wrangler deploy", execOptions);
  console.log("Deployment complete!");
} catch (err) {
  console.error("ERROR: Deployment failed", err);
}
