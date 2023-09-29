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
    // the attribute names below represent the crewjam IDP example, be sure to update them to match your provider info
    let firstname = ctx.v1.providerInfo.attributes["urn:oid:2.5.4.42"];
    let lastname = ctx.v1.providerInfo.attributes["urn:oid:2.5.4.4"];
    let email = ctx.v1.providerInfo.attributes["urn:oid:1.3.6.1.4.1.5923.1.1.1.6"];
    let displayname = ctx.v1.providerInfo.attributes["urn:oid:2.5.4.3"];
    let username = ctx.v1.providerInfo.attributes["urn:oid:0.9.2342.19200300.100.1.1"];
    if (firstname != undefined) {
    	api.setFirstName(firstname[0]);
    }
    if (lastname != undefined) {
	api.setLastName(lastname[0]);
    }
    if (email != undefined) {
    	api.setEmail(email[0]);
	api.setEmailVerified(true);
    }
    if (displayname != undefined) {
	api.setDisplayName(displayname[0]);
    }
    if (username != undefined) {
	api.setPreferredUsername(username[0]);
    }
}