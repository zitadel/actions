<p align="center">
    <img src="https://raw.githubusercontent.com/zitadel/zitadel/refs/heads/main/docs/static/logos/zitadel-logo-dark%402x.png" alt="Zitadel Logo" max-height="200px" width="auto" />
</p>

# Cloudflare Worker Deployment Script for Zitadel Actions V2

This repository provides a Node.js utility for automating Cloudflare Worker deployments via the `wrangler` CLI. 
It supports environment variable (secret) injection for signature validation.

---

## Overview

With this script, you can:

- **Deploy** Worker scripts programmatically from Node.js (no manual upload).  
- **Inject secrets** (such as `SIGNING_KEY`).  
- **Update existing Workers** or create new ones.  

---

## Requirements

- Node.js
- **Cloudflare account** with access to Workers
- Cloudflare **API Token** (with “Edit Cloudflare Workers” permission)

---

## Environment setup

Before running the script, create an `.env` file and add the following variables:

| Variable | Description |
|-----------|--------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token |
| `SIGNING_KEY` | Secret key to add to Worker env |

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
main = "./scripts/<SCRIPT_TO_DEPLOY>.js"
compatibility_date = "2023-10-01"
account_id = "<CLOUDFLARE_ACCOUNT_ID>"
workers_dev = true
[observability.logs]
enabled = true
```

### 3 - Run the deploy node script
```bash
npm start
```
---
### Notes
- You can add more secrets by editing the `secrets` array in `deploy.js`.
- The script automatically sets the `CLOUDFLARE_API_TOKEN` from your `.env` file.
- Designed to integrate seamlessly with Zitadel Actions V2 for secure, automated deployments.



