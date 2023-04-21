/**
 * Add an additional claim to the token / userinfo, if it's not already present
 *
 * Flow: Complement token, Triggers: Pre Userinfo creation, Pre access token creation
 *
 * @param ctx
 * @param api
 */
function addClaim(ctx, api) {
  api.v1.claims.setClaim('year', 2023)
}
