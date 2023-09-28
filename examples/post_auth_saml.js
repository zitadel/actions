/**
 * Use SAML attributes from external IDP as attributes for user creation/update
 *
 * Flow: External Authentication, Trigger: Post authentication
 *
 * @param ctx
 * @param api
 */
function map(ctx, api) {
    if (ctx.v1.externalUser.externalIdpId != "your_external_idp") {
        return
    }
    api.setFirstName(ctx.v1.providerInfo.attributes["urn:oid:2.5.4.42"][0]);
    api.setLastName(ctx.v1.providerInfo.attributes["urn:oid:2.5.4.4"][0]);
    api.setEmail(ctx.v1.providerInfo.attributes["urn:oid:1.3.6.1.4.1.5923.1.1.1.6"][0]);
    api.setEmailVerified(true);
    api.setDisplayName(ctx.v1.providerInfo.attributes["urn:oid:2.5.4.3"][0]);
    api.setPreferredUsername(ctx.v1.providerInfo.attributes["urn:oid:0.9.2342.19200300.100.1.1"][0]);
}