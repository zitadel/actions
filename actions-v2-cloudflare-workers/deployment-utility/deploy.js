import inquirer from "inquirer";
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

// Get available scripts
const scriptsDir = path.resolve("../scripts");
const availableScripts = fs.readdirSync(scriptsDir).filter((f) =>
  fs.statSync(path.join(scriptsDir, f)).isDirectory()
);

if (availableScripts.length === 0) {
  console.error("No scripts found in ../scripts folder");
  process.exit(1);
}

// Ask the user to select a script
const { scriptName } = await inquirer.prompt([
  {
    type: "list",
    name: "scriptName",
    message: "Select the code to deploy:",
    choices: availableScripts,
  },
]);

const scriptPath = path.resolve(`../scripts/${scriptName}`);
console.log(`Deploying Script from folder: ${scriptPath}`);

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
