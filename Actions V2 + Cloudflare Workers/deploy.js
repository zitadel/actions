import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.error("❌ CLOUDFLARE_API_TOKEN is not set in your environment or .env file");
  process.exit(1);
}

const execOptions = {
  stdio: "inherit",
  env: { ...process.env },
};

const secrets = ["SIGNING_KEY"];

for (const key of secrets) {
  if (process.env[key]) {
    try {
      console.log(`🔐 Syncing secret: ${key}`);
      execSync(
        `echo "${process.env[key]}" | npx wrangler secret put ${key}`,
        execOptions
      );
      console.log(`✅ Secret ${key} synced successfully`);
    } catch (err) {
      console.error(`❌ Failed to sync secret ${key}`, err);
    }
  }
}

try {
  console.log("🚀 Deploying to Cloudflare Workers...");
  execSync("npx wrangler deploy", execOptions);
  console.log("✅ Deployment complete!");
} catch (err) {
  console.error("❌ Deployment failed", err);
}
