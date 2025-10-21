<p align="center">
    <img src="https://raw.githubusercontent.com/zitadel/zitadel/refs/heads/main/docs/static/logos/zitadel-logo-dark%402x.png" alt="Zitadel Logo" max-height="200px" width="auto" />
</p>

# **Zitadel Actions V2 Examples**

This repository provides a collection of **ready-to-deploy Cloudflare Worker examples** that integrate with **Zitadel Actions V2**.  
Each script demonstrates how to handle Zitadel events, signatures, and responses directly from a serverless Cloudflare Worker environment.

---

## Repository Structure

- **[`scripts/`](/Actions%20V2%20+%20Cloudflare%20Workers/scripts/)** — Contains ready-to-use Cloudflare Worker sample scripts.  
- **[`deployment-utility/`](/Actions%20V2%20+%20Cloudflare%20Workers/deployment-utility/)** — A Node.js utility that deploys scripts programmatically using the `wrangler` CLI, making it easier to update code and inject secrets.  
- **[SCRIPT-NAME.md](/Actions%20V2%20+%20Cloudflare%20Workers/CUSTOM-CLAIMS.md)** — Each sample Action has its own setup guide.

---

## Running the Code

Each sample script is designed to run seamlessly on Cloudflare Workers, but the code can be adapted to deploy on the platform of your choice.

To deploy a script, you can use the deployment utility or deploy directly from this repository using the **Deploy to Cloudflare** button at the bottom of each sample guide.

For example: [Custom Claim Injection](/Actions%20V2%20+%20Cloudflare%20Workers/CUSTOM-CLAIMS.md)
