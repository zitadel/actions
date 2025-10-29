<p align="center">
    <img src="./assets/logo.png" alt="Zitadel Logo" max-height="200px" width="auto" />
</p>

# **Zitadel Actions V2 Examples**

This repository provides a collection of **ready-to-deploy Cloudflare Worker examples** that integrate with **Zitadel Actions V2**.  
Each script demonstrates how to handle Zitadel events, signatures, and responses directly from a serverless Cloudflare Worker environment.

---

## Repository Structure

- **[`scripts/`](/actions-v2-cloudflare-workers/scripts/)** — Contains ready-to-use Cloudflare Worker sample scripts.  
- **[`deployment-utility/`](/actions-v2-cloudflare-workers/deployment-utility/)** — A Node.js utility that deploys scripts programmatically using the `wrangler` CLI, making it easier to update code and inject secrets.  
- **[`SCRIPT-NAME.md`](/actions-v2-cloudflare-workers/CUSTOM-CLAIMS.md)** — Each sample Action has its own setup guide.

---

## Running the Code

Each JavaScript sample script is designed to run seamlessly on Cloudflare Workers, but the code can be adapted to deploy on the platform of your choice.

To deploy a script, you can download this repository and run the [`deployment utility`](/actions-v2-cloudflare-workers/deployment-utility/README.md), which simplifies running each example and automatically uploads the environment **variables** needed by each script. 

Create a [**Cloudflare account**](https://www.cloudflare.com/) and follow the steps to deploy your first Action. For example: [Custom Claim Injection](/actions-v2-cloudflare-workers/CUSTOM-CLAIMS.md)
