<p align="center">
    <img src="./assets/logo.png" alt="Zitadel Logo" max-height="200px" width="auto" />
</p>

# Custom Claim Injection

The [`custom-claims.js`](/actions-v2-cloudflare-workers/scripts/custom-claims/custom-claims.js) Action script demonstrates how to add a custom claim to the access token. This example sets a static value, but it can be easily adapted to match another use case.

## What It Does

1. **Validates** request path and method (`POST /`)
2. **Checks** that `SIGNING_KEY` is configured
3. **Verifies** the HMAC signature from the `zitadel-signature` header
4. **Parses** the request body
5. **Returns** a JSON object with appended claims

---

## Environment Variables

Ensure the following environment variable is set:

- `SIGNING_KEY`: The signing key provided by Zitadel when the target is created.

---

## Create the Target

To create a target, use the “CreateTarget” request from our [Postman collection](https://zitadel.com/docs/apis/introduction#postman-collection-beta), or check our API docs, sending the following body:

```json
{
   "name": "CustomClaims Webhook",
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
   - Create a new function → **preaccesstoken**
   - Select the **Custom Claims** target

---

## Deployment

Check the [`deployment utility`](deployment-utility/README.md) for instructions on how to deploy this code and the required environment variables to Cloudflare workers.

---

## Troubleshooting
The `wrangler.toml` file used to upload the worker enables observability, which makes it easier to troubleshoot issues with the code. 

To view the worker logs:
- 1. Open the worker view
- 2. Go to `Observability`

To view or update the worker secrets:
- 1. Open the worker view
- 2. Go to `Settings` → `Variables and Secrets`


