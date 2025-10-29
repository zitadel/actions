import { execSync } from "child_process";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const scriptName = process.argv[2];

if (!scriptName) {
  console.error("Usage: npm start <script-name>");
  process.exit(1);
}

if (!process.env.CF_API_TOKEN) {
  console.error("ERROR: CF_API_TOKEN is missing in your .env file");
  process.exit(1);
}

if (!process.env.CF_ACCOUNT_ID) {
  console.error("ERROR: CF_ACCOUNT_ID is missing in your .env file");
  process.exit(1);
}

const execOptions = {
  stdio: "inherit",
  env: { ...process.env },
};

const scriptPath = path.join("..", "scripts", scriptName);

if (!fs.existsSync(scriptPath)) {
  console.error(`ERROR: The script folder '${scriptPath}' does not exist.`);
  process.exit(1);
}

console.log(`🚀 Deploying script from folder: ${scriptPath}`);

const secrets = Object.keys(process.env).filter(
  (key) => !key.startsWith("CF_")
);

for (const key of secrets) {
  try {
    console.log(`🔑 Syncing secret: ${key}`);
    execSync(
      `echo "${process.env[key]}" | npx wrangler secret put ${key} --name ${scriptName}`,
      execOptions
    );
    console.log(`✅ Secret '${key}' synced successfully`);
  } catch (err) {
    console.error(`❌ ERROR: Failed to sync secret '${key}'`, err.message);
  }
}

try {
  console.log("📦 Deploying to Cloudflare Workers...");
  execSync(
    `npx wrangler deploy ${path.join(scriptPath, "wrangler.toml")} --name ${scriptName} --account-id ${process.env.CF_ACCOUNT_ID}`,
    execOptions
  );
  console.log("✅ Deployment complete!");
} catch (err) {
  console.error("❌ ERROR: Deployment failed", err.message);
  process.exit(1);
}
