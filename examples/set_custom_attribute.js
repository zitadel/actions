/**
 * Add an custom attribute to the SAMLResponse, if it's not already present.
 * This example will add the resourceOwner as custom attribute `orgID`.
 * It additionally shows how get the user's project authorization and add each role in the form of `projectId:role` as a `Roles` attribute.
 *
 * Flow: Complement SAMLResponse, Triggers: Pre SAMLResponse creation
 *
 * @param ctx
 * @param api
 */
function setCustomAttribute(ctx, api) {
    const user = ctx.v1.getUser()
    api.v1.attributes.setCustomAttribute('orgID', '', user.resourceOwner)

    if (ctx.v1.user.grants == undefined || ctx.v1.user.grants.count == 0) {
        return;
    }
    let roles = [];
    ctx.v1.user.grants.grants.forEach(grant => {
        grant.roles.forEach(role => {
            roles.push(grant.projectId+':'+role)  
        })
    })
    api.v1.attributes.setCustomAttribute('Roles', '', ...roles)
  }