/**
 * This example demonstrates how to retrieve the organisation metadata.
 * In this case it will be used to set the values as custom attributes on the SAML response.
 * 
 * Requires: ZITADEL >=v2.45.0
 *
 * Flow: Complement SAMLResponse, Triggers: Pre SAMLResponse creation
 *
 * @param ctx
 * @param api
 */
function setOrgAttribute(ctx, api) {
    let metadata = ctx.v1.org.getMetadata()
    if (metadata === undefined || metadata.count == 0) {
        return
    }
    metadata.metadata.forEach(md => {
        api.v1.attributes.setCustomAttribute('org_attribute_'+md.key,'', md.value);
    })
}