function addGrant(ctx, api) {
    api.userGrants.push({
        ProjectID: '<the projects resource ID>',
        Roles: ['<the role key>']
    });
}