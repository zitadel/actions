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

  for (let i in metadata.metadata) {
      if (metadata.metadata[i].key == "idpPicture") {
          let picture = metadata.metadata[i].value
          if (picture) {
              api.v1.claims.setClaim('picture', picture);
          }
          break
      }
  }
}
