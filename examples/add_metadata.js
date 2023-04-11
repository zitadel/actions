/**
 * Add metadata if metadata are available
 *
 * Flow: External Authentication or Internal Authentication, Trigger: Pre Creation, Post Creation, Post Authentication
 *
 * @param ctx
 * @param api
 */
function add_metadata(ctx, api) {
  if (api.metadata === undefined) {
    return;
  }
  
  api.v1.user.appendMetadata('add', 'me');
}
