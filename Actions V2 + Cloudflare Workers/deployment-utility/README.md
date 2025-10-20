<p align="center">
    <img src="https://raw.githubusercontent.com/zitadel/zitadel/refs/heads/main/docs/static/logos/zitadel-logo-dark%402x.png" alt="Zitadel Logo" max-height="200px" width="auto" />
</p>

# Cloudflare Worker Deployment Utility for **Zitadel Actions V2 Examples**

This repository provides a **Node.js deployment utility** that automates the process of publishing Zitadel Action V2 example scripts (found under the `/action-scripts` folder) to **Cloudflare Workers**.  

It wraps the [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) CLI to handle uploads, environment variable (secret) injection, and version updates — letting you test and iterate on your Zitadel Cloudflare integrations with minimal setup.

---

## Overview

With this utility, you can:

- **Deploy any example script** from the `/action-scripts` folder to Cloudflare Workers with a single command.  
- **Inject secrets automatically** (e.g. `SIGNING_KEY`, `ACCESS_TOKEN`, etc.) from your `.env` file.  
- **Re-deploy or update existing Workers** without manual CLI interaction.  

---

## Example Use Cases

You can use this deployment utility to publish examples like:

- `jit-users-migration.js` — automatically migrate legacy users from an external database during login.  
- `datadog-forwarder.js` — forward Zitadel webhook events to Datadog for observability.  
- `custom-claims.js` — add custom claims to your access token.
- `idp-mappings.js` — map attributes from an external IDP.

Each script in `/action-scripts` is a ready-to-deploy Cloudflare Worker entrypoint — you only need to configure the environment variables.

---

## Requirements

- Node.js
- **Cloudflare account** with access to Workers
- Cloudflare **API Token** (with “Edit Cloudflare Workers” permission)

---

## Environment setup

Before running the script, create an `.env` file and add the required variables, for example:

| Variable | Description |
|-----------|--------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (not optional - used by the deploy script) |
| `SIGNING_KEY` | Secret key to add to Worker env |


Update the deploy script to insert the environment variables:
```bash
const secrets = ["SIGNING_KEY"];
```

---

## Usage

### 1 - Install dependencies
```bash
npm install
```

### 2 - Update the wrangler.toml file with your worker data

The `wrangler.toml` file defines your Worker’s configuration (name, script to deploy and account ID). Update it with your own project details before deploying:

```bash
name = "<WORKER_NAME>"
main = "../action-scripts/<SCRIPT_TO_DEPLOY>.js"
compatibility_date = "2023-10-01"
account_id = "<CLOUDFLARE_ACCOUNT_ID>"
workers_dev = true
[observability.logs]
enabled = true
```
You can switch the script path (main) to any example file in `/action-scripts`.

### 3 - Run the deploy node script
```bash
npm start
```
---
### Notes
- You can add more secrets by editing the `secrets` array in `deploy.js`.
- The script automatically sets the `CLOUDFLARE_API_TOKEN` from your `.env` file.
- Designed to integrate seamlessly with Zitadel Actions V2 for secure, automated deployments.



