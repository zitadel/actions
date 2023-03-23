
/**
 * Set first and lastname of a user on just in time provisioning for github.
 * Useful if you like to fill the first and lastname with the name stored on github, so the user doesn't have to fill himself.
 *
 * Flow: External Authentication, Trigger: Post Authentication
 *
 * @param ctx
 * @param api
 */
function mapGitHubOAuth(ctx, api) {
    
  if (ctx.v1.externalUser.externalIdpId != "your-idp-id") {
    return
  }
  api.setFirstName(ctx.v1.providerInfo.name);
  api.setLastName(ctx.v1.providerInfo.name);
}
