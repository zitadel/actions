/**
 * This example demonstrates how to set a custom groups claim using also the organisation metadata of the user grants.
 * 
 * Requires: ZITADEL >=v2.51.0
 *
 * Flow: Complement token, Triggers: Pre Userinfo creation, Pre access token creation
 * 
 * Assuming there are two organizations:
 *  - ID: 201982826478953724
 *    Domain: zitadel.localhost
 *    Metadata:
 *     - key: crm-id
 *       value: 6d6dee11-31d3-49c3-9087-99216c9cb6f6
 *  - ID: 263022974217486756
 *    Domain: other-org.localhost
 *    Metadata:
 *     - key: crm-id
 *       value: 77b597dc-8a5b-4e55-a6b5-80a6a475c062
 * 
 * and the user is granted the `user` role on both organizations, the group claim of the token looks like the following:
 * 
 * // added by the code below
 * "groups": ["user:6d6dee11-31d3-49c3-9087-99216c9cb6f6", "user:77b597dc-8a5b-4e55-a6b5-80a6a475c062", ...],
 * // added automatically
 * "urn:zitadel:iam:org:project:roles": {
 *   "user": {
 *     "201982826478953724": "zitadel.localhost",
 *     "263022974217486756": "other-org.localhost"
 *   }
 * }
 *
 * Flow: Complement token, Triggers: Pre Userinfo creation, Pre access token creation
 *
 * @param ctx
 * @param api
 */
function groups(ctx, api) {
    if (ctx.v1.user.grants == undefined || ctx.v1.user.grants.count == 0) {
        return;
    }
  
    let groups = [];
    ctx.v1.user.grants.grants.forEach(grant => {
        let crmId = grant.getOrgMetadata().metadata.find(md => md.key == 'crm-id')
        if (crmId) {
        	grant.roles.forEach(role => {
	            groups.push(role+":"+crmId.value)  
            })
        }
    })
    api.v1.claims.setClaim('groups', groups)
}