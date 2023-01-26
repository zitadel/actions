/**
 * Log successful and failed authentications with relevant information
 *
 * Flow: External/Internal Authentication, Trigger: Post authentication
 *
 * @param ctx
 * @param api
 */
let logger = require("zitadel/log")
function log(ctx, api) {
    if (ctx.v1.authError == "none") {
        logger.log("successful login: username/" + ctx.v1.authRequest.userName + ", timestamp/" + ctx.v1.authRequest.changeDate + ", appID/" + ctx.v1.authRequest.applicationId + ", remoteAddr/" + ctx.v1.httpRequest.remoteAddr + ", request/" + JSON.stringify(ctx.v1.httpRequest))
    } else {
        logger.log("authentication failed: error/" + ctx.v1.authError + ", username/" + ctx.v1.authRequest.userName + ", timestamp/" + ctx.v1.authRequest.changeDate + ", appID/" + ctx.v1.authRequest.applicationId + ", remoteAddr/" + ctx.v1.httpRequest.remoteAddr + ", request/" + JSON.stringify(ctx.v1.httpRequest))
    }
}