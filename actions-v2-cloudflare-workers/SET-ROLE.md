# Set Role Action

The `set-role.js` script provides an Action for assigning default roles to users upon sign-up. This is achieved by listening to the `user.human.added` event and calling the `CreateAuthorization` endpoint. This works for both internal and external users.

**Method:** POST

This endpoint is triggered during the `user.human.added` event to assign default roles to the user.

---

## Functionality

1. **Signature Validation:**
   - Validates the webhook signature using the `SET_ROLE_SIGNING_KEY` environment variable.

2. **Role Assignment:**
   - Extracts the user ID, organization ID, and default roles from the event payload and environment variables.
   - Calls the `CreateAuthorization` endpoint to assign the roles to the user.

---

## Environment Variables

- `SET_ROLE_SIGNING_KEY`: The signing key for validating the webhook signature.
- `ACCESS_TOKEN`: The access token for Zitadel APIs. This token must have permission to call the `CreateAuthorization` endpoint.
- `ZITADEL_DOMAIN`: The Zitadel domain (e.g., `auth.example.com`).
- `PROJECT_ID`: Project ID is the ID of the project the user should be authorized for.
- `ROLE_KEYS`: A comma-separated list of default roles to assign.

The `organizationId` parameter is extracted from the event payload. It is the ID of the organization on which the authorization should be created. The organization must either own the project or have a grant for the project.

### Example Payload

```json
{
  "userId": "string",
  "projectId": "string",
  "organizationId": "string",
  "roleKeys": [
    "string"
  ]
}
```

---

## Deployment

Refer to the [`deployment utility`](deployment-utility/README.md) documentation for instructions on deploying this script to Cloudflare Workers.

---

## Notes

- Ensure the `SET_ROLE_SIGNING_KEY`, `ACCESS_TOKEN`, `ZITADEL_DOMAIN`, `PROJECT_ID`, and `ROLE_KEYS` environment variables are correctly set before deploying the worker.
- The access token used by the worker must have permission to call the `CreateAuthorization` endpoint.

---

## Troubleshooting
The `wrangler.toml` file used to upload the worker enables observability, which makes it easier to troubleshoot issues with the code. 

To view the worker logs:
1. Open the worker view
2. Go to `Observability`

To view or update the worker secrets:
1. Open the worker view
2. Go to `Settings` → `Variables and Secrets`
