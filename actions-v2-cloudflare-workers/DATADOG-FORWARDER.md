<p align="center">
    <img src="https://raw.githubusercontent.com/zitadel/zitadel/refs/heads/main/docs/static/logos/zitadel-logo-dark%402x.png" alt="Zitadel Logo" max-height="200px" width="auto" />
</p>

# Datadog events forwarder

The [`datadog-forwarder.js`](/actions-v2-cloudflare-workers/scripts/datadog-forwarder/datadog-forwarder.js) Action script demonstrates how forward events from your Zitadel instance to Datadog - This example code can be easily modified for any other provider, for example Splunk.

## What It Does

1. **Validates** request path and method (`POST /`)
2. **Checks** that `SIGNING_KEY` is configured
3. **Verifies** the HMAC signature from the `zitadel-signature` header
4. **Parses** the request body
5. **Forwards** a JSON object with the event data to the specified endpoint.

---

## Environment Variables

Ensure the following environment variables are set:

- `SIGNING_KEY`: The signing key provided by Zitadel when the target is created.
- `DD_URL`: The Datadog URL (for example: `https://http-intake.logs.datadoghq.com` for the US-site)
- `DD_API_KEY`: The Datadog API key
---

## Create the Target

To create a target, use the “CreateTarget” request from our [Postman collection](https://zitadel.com/docs/apis/introduction#postman-collection-beta), or check our API docs, sending the following body:

```json
{
   "name": "Events forwarder Webhook",
   "restAsync": {
       "interruptOnError": false
   },
   "endpoint": "https://<HOSTING_DOMAIN>",
   "timeout": "10s"
}
```

Copy the signing key returned, this must be saved as the `SIGNING_KEY` environment variable.
The response will look like this:

```json
{
   "id": "342320645008366333",
   "creationDate": "2025-10-15T13:30:04.462592Z",
   "signingKey": "<SIGNING_KEY>"
}
```

---

## Create the Action

Open your **Zitadel Console** and navigate to the **Actions** tab.  
   - Create a new Action for the Events forwarder Webhook → **Events**
   - Select **All**

---

## Deployment

You can deploy this code directly from this repository for quick testing, or you can use the deployment utility.

### Scripted Deployment

Check the deployment utility [README](deployment-utility/README.md) for instructions on how to deploy this code and the required environment variables to Cloudflare workers.


### Deploy from this repository

You will have to manually add the secrets when the deployment is completed.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zitadel/actions/tree/main/actions-v2-cloudflare-workers/scripts/datadog-forwarder)

---

## Troubleshooting
The `wrangler.toml` file used to upload the enables observability, which makes it easier to troubleshoot issues with the code. 

To view the worker logs:
- 1. Open the worker view
- 2. Go to `Observability`

To view/update the worker secrets:
- 1. Open the worker view
- 2. Go to `Settings` → `Variables and Secrets`


