/**
 * Set first and lastname of a user on just in time provisioning for okta.
 * Useful if you like to fill the first and lastname with the name stored on okta, so the user doesn't have to fill himself.
 * Also set email to verified, so the user doesn't get a verification email
 *
 * Flow: External Authentication, Trigger: Post Authentication
 *
 * @param ctx
 * @param api
 */
let logger = require("zitadel/log")

function mapOktaOauth(ctx, api) {
  logger.log('Populating extra information for new Okta user');

  if (ctx.v1.externalUser.externalIdpId != "your-idp-id") {
    return
  }
  api.setFirstName(ctx.v1.providerInfo.name);
  api.setLastName(ctx.v1.providerInfo.name);
  api.setEmailVerified(true)
  api.setEmail(ctx.v1.providerInfo.email)
  api.setPreferredUsername(ctx.v1.providerInfo.preferred_username)
}