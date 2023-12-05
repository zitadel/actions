/**
 * Returns an error
 * The error looks as follows in the login ui:
 * some error at err (:9:2(2))
 *
 * Flow: all flows
 */
function err(ctx, api) {
	throw "some error"
}
