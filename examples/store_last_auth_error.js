/**
 * Store the last error state by login factor to the users metadata
 *
 * Flow: Internal Authentication, Trigger: Post Authentication
 *
 * @param ctx
 * @param api
 */
function storeLastErrorStateToMetadata(ctx, api) {
  const mgmt = api.v1.mgmt;
  const authRequest = ctx.v1.authRequest;
  const goCtx = ctx.v1.ctx;
  const authMethod = ctx.v1.authMethod;
  const authError = ctx.v1.authError;

  mgmt.setUserMetadata(goCtx, {
    id: authRequest.userID,
    key: `last ${authMethod} error`,
    value: authError,
  });
}
