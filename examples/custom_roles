/**
 * sets the roles an additional claim in the token with roles as value an project as key
 * 
 * The role claims of the token look like the following:
 * 
 * // added by the code below
 * "my:zitadel:grants": ["{projectId}:{roleName}", "{projectId}:{roleName}", ...],
 * // added automatically
 * "urn:zitadel:iam:org:project:roles": {
 *   "asdf": {
 *     "201982826478953724": "zitadel.localhost"
 *   }
 * }
 *
 * Flow: Complement token, Triggers: Pre Userinfo creation, Pre access token creation
 *
 * @param ctx
 * @param api
 */
function flatRoles(ctx, api) {
  if (ctx.v1.user.grants === undefined || ctx.v1.user.grants.count == 0) {
    return;
  }

  let grants = [];
  ctx.v1.user.grants.grants.forEach(claim => {
    claim.roles.forEach(role => {
        grants.push(claim.projectId+':'+role)  
    })
  })

  api.v1.claims.setClaim('my:zitadel:grants', grants)
}
