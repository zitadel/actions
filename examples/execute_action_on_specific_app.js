
/**
 * Logs if the app is console
 * Useful if you like to execute an action for specific apps
 *
 * Flows:
 * 
 *  - Internal Authentication, Triggers: Pre Creation, Post Creation, Post Authentication
 *  - External Authentication, Triggers: Pre Creation, Post Creation, Post Authentication
 *
 * @param ctx
 * @param api
 */
let logger = require('zitadel/log');

function logConsole(ctx, api) {
    if (ctx.v1.authRequest == undefined || ctx.v1.authRequest.applicationId == '') {
        logger.log('🤖 No auth request or app id provided');
        return;
    }
    if (ctx.v1.authRequest.applicationId == 'your-zitadel-console--client-id') {
        logger.log('🤖 authentication with console');
        return;
    }
    logger.log('🤖 authentication with another app: ' + ctx.v1.authRequest.applicationId);
}
  
