/**
 * This example demonstrates how to retrieve the organisation metadata.
 * In this case it will be used to set the values as custom claims in the tokens / userinfo and introspection response.
 * 
 * Requires: ZITADEL >=v2.45.0
 *
 * Flow: Complement token, Triggers: Pre Userinfo creation, Pre access token creation
 *
 * @param ctx
 * @param api
 */
function setOrgClaims(ctx, api) {
    let metadata = ctx.v1.org.getMetadata()
    if (metadata === undefined || metadata.count == 0) {
        return
    }
    metadata.metadata.forEach(md => {
        api.v1.claims.setClaim('org_claim_'+md.key, md.value);
    })
}