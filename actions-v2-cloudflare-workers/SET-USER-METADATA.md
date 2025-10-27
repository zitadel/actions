<p align="center">
    <img src="./assets/logo.png" alt="Zitadel Logo" max-height="200px" width="auto" />
</p>

# Set User Metadata

The [`set-user-metadata.js`](/actions-v2-cloudflare-workers/scripts/set-user-metadata/set-user-metadata.js) Action script demonstrates how to add metadata to the user profile. This example sets the time of last login, but it can be easily adapted to match another use case.

## What It Does

1. **Validates** request path and method (`POST /`)
2. **Checks** that `SIGNING_KEY` is configured
3. **Verifies** the HMAC signature from the `zitadel-signature` header
4. **Parses** the request body
5. **Returns** a JSON object with appended metadata

---

## Environment Variables

Ensure the following environment variable is set:

- `SIGNING_KEY`: The signing key provided by Zitadel when the target is created.

---

## Create the Target

To create a target, use the “CreateTarget” request from our [Postman collection](https://zitadel.com/docs/apis/introduction#postman-collection-beta), or check our API docs, sending the following body:

```json
{
   "name": "Append Metadata Webhook",
   "restCall": {
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
   - Create a new function → **preuserinfo**
   - Select the **Append Metadata** target

---

## Deployment

You can deploy this code directly from this repository for quick testing, or you can use the deployment utility.

### Scripted Deployment

Check the deployment utility [README](deployment-utility/README.md) for instructions on how to deploy this code and the required environment variables to Cloudflare workers.


### Deploy from this repository

You will need to manually add the secrets once deployment is complete.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zitadel/actions/tree/main/actions-v2-cloudflare-workers/scripts/set-user-metadata)

---

## Troubleshooting
The `wrangler.toml` file used to upload the worker enables observability, which makes it easier to troubleshoot issues with the code. 

To view the worker logs:
- 1. Open the worker view
- 2. Go to `Observability`

To view or update the worker secrets:
- 1. Open the worker view
- 2. Go to `Settings` → `Variables and Secrets`


