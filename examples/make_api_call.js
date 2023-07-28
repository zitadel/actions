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
