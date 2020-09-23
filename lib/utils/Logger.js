const log4js = require('log4js');
log4js.configure({
    appenders: { console: { type: 'console' } },
    categories: { default: { appenders: [ 'console' ], level: process.env.LOG_LEVEL || 'info' } }
});
const path = require('path');
/**
 * A modular logger for the entire micro-service fabric.
 * Example usage
 *
 *
 var logger = log4js.getLogger('ben');
 logger.level = 'debug';
 logger.info("Some debug messages");
 *
 */

module.exports = (moduleName) => {

    return log4js.getLogger("[" + path.parse(moduleName.filename).name + "]");

};