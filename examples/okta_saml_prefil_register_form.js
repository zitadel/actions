/**
 * Use SAML attributes from OKTA SAML SP as attributes for user creation/update
 *
 * Flow: External Authentication, Trigger: Post authentication
 *
 * @param ctx
 * @param api
 */
function prefilRegisterFromOKTASAML(ctx, api) {
	if (ctx.v1.externalUser.externalIdpId != "<SAML IDP ID>") {
        return
    }
    // the attribute names below represent a attribute statement with basic format (configured in OKTA App)
    let firstname = ctx.v1.providerInfo.attributes["givenname"];
    let lastname = ctx.v1.providerInfo.attributes["surname"];
    let email = ctx.v1.providerInfo.attributes["emailaddress"];
    let username = ctx.v1.providerInfo.attributes["emailaddress"];
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
    if (username != undefined) {
	    api.setPreferredUsername(username[0]);
    }    
}
