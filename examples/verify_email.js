/**
 * Set verified email of a user to true.
 * Useful if external identity provider doesn't send email verified attribute or you like to add all users with a verified email.
 *
 * Flow: External Authentication, Trigger: Pre Creation
 *
 * @param ctx
 * @param api
 */
function setEmailVerified(ctx, api) {
    api.setEmailVerified(true)
}