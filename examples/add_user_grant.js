function addGrant(ctx, api) {
    api.userGrants.push({
        ProjectID: '<the projects resource ID you copied above>',
        Roles: ['<the role key you copied above>']
    });
}