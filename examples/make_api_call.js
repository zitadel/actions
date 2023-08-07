/**
 * Call an HTTP endpoint to send / retrieve information.
 * This example show a simple POST method and logs the retrieved id.
 *
 * Flow: External/Internal Authentication and Complement token, Trigger: all
 *
 * @param ctx
 * @param api
 */
let http = require('zitadel/http')
let logger = require("zitadel/log")
function make_api_call(ctx, api) {
    var user = http.fetch('API_URL', {
        method: 'POST',
        body: {
            "name": "user 1"
        }
    }).json();
    logger.log(user.id);
}
