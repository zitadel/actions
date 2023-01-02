// this action can be used in the triggers of flow type `Complement Claims`
function addClaim(ctx, api) {
  // this line adds the claim to the token, if it's not already present
  api.v1.userinfo.setClaim('year', 2023)
}
