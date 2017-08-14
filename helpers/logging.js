/**
 * Handles Error logging
 * @version 0.1 
 */
'use strict'
const path = require('path');
const winston = require ('winston');

const logFilePath = path.join(__dirname, '../logs/errors.log');

const  logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            filename: logFilePath,
            timestamp: function() {
                return new Date();
            },
            formatter: function(options){
                return options.timestamp +' - '+ options.level.toUpperCase() +' - '+ (options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            }
        })
    ]
});


/**
 * Logs Error
 * @param {object} err
 * @prop {string} err.Level - e.g error, warn, info, verbose, debug, silly
 * @prop {string} err.Message - Error Message
 * @namespace
 * @prop {object} errOpt
 * @prop {string} err.errOpt.type
 * @prop {string} err.errOpt.status
 * @prop {string} err.errOpt.cause
 * @prop {string} err.errOpt.stack
 */
exports.log = function(err){
    logger.log(err.Level, err.Message, err.errOpt);
}
