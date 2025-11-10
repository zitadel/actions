<p align="center">
    <img src="./assets/logo.png" alt="Zitadel Logo" max-height="200px" width="auto" />
</p>

# Authorization Action

The [`authorization.js`](./scripts/authorization/authorization.js) Action script provides an Action for extending authorization in Zitadel to include permissions grouped by roles. This is achieved by mapping roles to permissions using organization metadata.

**Method:** POST

This webhook is triggered during the preAccessToken phase to append a `permissions` claim based on the user's roles and organization metadata.

---

## What It Does

1. **Validates** request path and method (`POST /`)
2. **Checks** that all environment variables are configured
3. **Verifies** the HMAC signature from the `zitadel-signature` header
4. **Parses** the request body
5. **Retrieves Organization Metadata:** Calls the `/zitadel.org.v2beta.OrganizationService/ListOrganizationMetadata` endpoint to fetch metadata for the user's organization.
6. **Role-to-Permissions Mapping:** Maps roles from `user_grants[].roles` to permissions using the organization metadata.
7. **Returns** a JSON object with appended `permissions` claim.

### Example Response

```json
{
  "append_claims": [
    {
      "key": "permissions",
      "value": ["read:all", "write:all"]
    }
  ]
}
```

---

## Environment Variables

- `ZITADEL_DOMAIN`: The Zitadel domain (e.g., `auth.example.com`).
- `AUTHORIZATION_SIGNING_KEY`: The signing key for validating the webhook signature.
- `ACCESS_TOKEN`: The access token for Zitadel APIs. This token must have permission to call the `ListOrganizationMetadata` endpoint.

---

## Create the Target

To create a target, use the “CreateTarget” request from our [Postman collection](https://zitadel.com/docs/apis/introduction#postman-collection-beta), or check our API docs, sending the following body:

```json
{
   "name": "Authorization Webhook",
   "restCall": {
       "interruptOnError": false
   },
   "endpoint": "https://<HOSTING_DOMAIN>",
   "timeout": "10s"
}
```

Copy the signing key returned, this must be saved as the `AUTHORIZATION_SIGNING_KEY` environment variable.
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
   - Create a new Function → **preaccesstoken**
   - Select the **Authorization Webhook** target

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

