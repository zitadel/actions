/**
 * Set IdP picture as metadata
 *
 * Flow: External Authentication, Trigger: Post authentication
 *
 * @param ctx
 * @param api
 */
function set_idp_picture_metadata(ctx, api) {
  // for production use cases, implement logging or alerting here to ensure traceability

  // return if api undefined
  if (api === undefined) {
    return;
  }

  const picture = ctx.getClaim('picture');

  if (picture !== null) {
    api.v1.user.appendMetadata('idpPicture', picture);
  }
}
