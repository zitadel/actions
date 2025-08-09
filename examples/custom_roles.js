const logger = require("zitadel/log");
const http = require('zitadel/http');
const ZITADEL_INSTANCE = 'https://<ZITADEL domain>';
// The Service user should have IAM_OWNER_VIEWER permission
// (basically should be Manager of Zitadel instance to call the API)
const SERVICE_USER_AUTH_TOKEN = '<PAT of Service User>';
/**
 * sets the roles an additional claim in the token with roles as value an project as key
 * 
 * The role claims of the token look like the following:
 * 
 * // added by the code below
 * "my:zitadel:grants": ["{projectId}:{roleName}", "{projectId}:{roleName}", ...],
 *
 * Flow: Complement token, Triggers: Pre Userinfo creation, Pre access token creation
 *
 * @param ctx
 * @param api
 */
function SetGroupClaimsFromProjectRoles(ctx, api) {
  // ctx.v1.user has "grants": null since Zitadel has deprecated "grants" and
  // replaced it with "Authorizations"
  let user = ctx.v1.getUser();
  
  let grants = [];
  let authz = listAuthorizations(user.id);
  if (!authz) {
    return;
  }
  authz.forEach(grant => {
    grant.roles.forEach(role => {
      grants.push(`${grant.projectName}/${role}`)  
    })
  });
  api.v1.claims.setClaim('my:zitadel:grants', grants)
}

function listAuthorizations(userId) {
  let resp;
  // API ref: https://zitadel.com/docs/apis/resources/authorization_service_v2/zitadel-authorization-v-2-beta-authorization-service-list-authorizations
  const url = `${ZITADEL_INSTANCE}/zitadel.authorization.v2beta.AuthorizationService/ListAuthorizations`;
  const request = {
    filters: [
      {
        userId: {
          id: userId
        }
      }
    ]
  }
  try {
    resp = http.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_USER_AUTH_TOKEN}`
      },
      body: request
    });
    if (resp.status !== 200) {
      throw new Error(`Invalid response: [${resp.status}] ${resp.text()}`);
    }
  } catch (error) {
    logger.error('[SetGroupClaimsFromProjectRoles] HTTP fetch error: ' + error);
    return
  }
  return resp.json()["authorizations"]
}
