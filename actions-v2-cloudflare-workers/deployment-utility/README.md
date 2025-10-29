<p align="center">
    <img src="../assets/logo.png" alt="Zitadel Logo" max-height="200px" width="auto" />
</p>

# Cloudflare Worker Deployment Utility for **Zitadel Actions V2 Examples**

This repository provides a **Node.js deployment utility** that automates the process of publishing Zitadel Action V2 example scripts (found under the [`/scripts`](/actions-v2-cloudflare-workers/scripts/) folder) to **Cloudflare Workers**.  

It wraps the [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) CLI to handle uploads, environment variable (secret) injection, and version updates — letting you test and iterate on your Zitadel Cloudflare integrations with minimal setup.

---

## Overview

With this utility, you can:

- **Deploy any example script** from the `/scripts` folder to Cloudflare Workers with a single command.  
- **Inject secrets automatically** (e.g. `SIGNING_KEY`, `ACCESS_TOKEN`, etc.) from your `.env` file.  
- **Re-deploy or update existing Workers** without manual CLI interaction.  

---

## Example Use Cases

You can use this deployment utility to publish examples like:

- `jit-users-migration.js` — automatically migrate legacy users from an external database during login.  
- `datadog-forwarder.js` — forward Zitadel webhook events to Datadog for observability.  
- `custom-claims.js` — add custom claims to your access token.
- `idp-mappings.js` — map attributes from an external IDP.
- Etc.

Each script in [`/scripts`](/actions-v2-cloudflare-workers/scripts/) is a ready-to-deploy Cloudflare Worker entrypoint — you only need to configure the environment variables.

---

## Requirements

- Node.js
- [**Cloudflare account**](https://www.cloudflare.com/) with access to Workers
- Cloudflare [**API Token**](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) (with “Edit Cloudflare Workers” permission)

---

## Environment setup

Before running the script, create an `.env` file and add the required variables, for example:

| Variable | Description |
|-----------|--------------|
| `CF_API_TOKEN` | Cloudflare API token (not optional - used by the deploy script) |
| `CF_ACCOUNT_ID` | Cloudflare Account ID (not optional - used by the deploy script) |
| `SECRET_1` | Secret key to add to Worker env |
| `SECRET_2` | Secret key to add to Worker env |

---

## Usage

### 1 - Install dependencies
```bash
npm install
```

### 2 - Include the secrets
Add to the `.env` file the secrets required by the worker, and add those secrets names to the `secrets` array in `deploy.js`

### 3 - Run the deploy node script
```bash
npm start
```
---

## Troubleshooting
The `wrangler.toml` file used to upload the worker enables observability, which makes it easier to troubleshoot issues with the code. 

To view the worker logs:
- 1. Open the worker view
- 2. Go to `Observability`

To view or update the worker secrets:
- 1. Open the worker view
- 2. Go to `Settings` → `Variables and Secrets`

---

## Notes
- You can add more secrets by editing the `secrets` array in `deploy.js`.
- The script automatically sets the `CF_API_TOKEN` from your `.env` file.
- Designed to integrate seamlessly with Zitadel Actions V2 for secure, automated deployments.



