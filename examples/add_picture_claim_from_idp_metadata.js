/**
 * Set picture claim from IdP picture metadata
 *
 * Flow: Complement token, Trigger: Pre Userinfo creation, Pre access token creation
 *
 * @param ctx
 * @param api
 */
function add_picture_claim_from_idp_metadata(ctx, api) {
  // return if picture already set
  if (ctx.v1.claims && ctx.v1.claims.picture) {
    return;
  }

  const metadata = ctx.v1.user.getMetadata();

  // assign picture from metadata, if present
  metadata.metadata.forEach(({ key, value: picture }) => {
    if (key === 'idpPicture' && picture) {
      api.v1.claims.setClaim('picture', picture);
    }
  });
}
