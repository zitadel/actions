/**
 * Use SAML attributes from entra id SAML SP as attributes for user creation/update
 *
 * Flow: External Authentication, Trigger: Post authentication
 *
 * @param ctx
 * @param api
 */
function prefilRegisterFromEntraId(ctx, api) {
	if (ctx.v1.externalUser.externalIdpId != "<SAML SP id>") {
        return
    }
    // the attribute names below represent the crewjam IDP example, be sure to update them to match your provider info
    let firstname = ctx.v1.providerInfo.attributes["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"];
    let lastname = ctx.v1.providerInfo.attributes["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"];
    let email = ctx.v1.providerInfo.attributes["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
    let displayname = ctx.v1.providerInfo.attributes["http://schemas.microsoft.com/identity/claims/displayname"];
    // username would look like this: adlerhurst_zitadel.com#EXT#@adlerhurstzitadel.onmicrosoft.com
    let username = ctx.v1.providerInfo.attributes["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
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
