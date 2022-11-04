/**
 * Add a usergrant to a new created/registered user
 *
 * Flow: External Authentication, Trigger: Post creation
 *
 * @param ctx
 * @param api
 */
function addGrant(ctx, api) {
    api.userGrants.push({
        ProjectID: '<the projects resource ID>',
        Roles: ['<the role key>']
    });
}