/**
 * Defines Apps Error Types 
 * @version 0.1
 */
'use strict'
const util = require('util');
const logger = require('./logging')
/**
 * Helper function to create generic error object with http status code
 * @param {String} name the error name
 * @param {String} defaultMessage the default message
 * @param {Number} statusCode the http status code
 * @returns {Function} the error constructor
 * @private
 */
function _createError(name, defaultMessage, statusCode, level){
    /**
     * The error constructor
     * @param {String} message the error message
     * @param {String} [cause] the error cause
     * @constructor
     */
    function ErrorCtor(err){
        Error.call(this);
        Error.captureStackTrace(this);
        this.Message = err.message || defaultMessage;
        this.Level = level
        this.errOpt = {
            Type: name,
            Status: statusCode,
            Stack: err.stack
        }
        _log(this)
    }
    util.inherits(ErrorCtor, Error);
    return ErrorCtor;
}

function _log(err){
    logger.log(err)
}

module.exports = {
    DBError: _createError('DBError', 'Unable to access DB', 'ERR_INVALID_ACCESS', "error"),
    UploadError: _createError('UploadError', 'Unable to upload files', 'ERR_FILE_UPLOAD', "error"),
    ScanError: _createError('ScanError', 'Unable to scan file', 'ERR_FILE_SCANNING', "error"),
    AzureError: _createError('AzureError', 'Unable to access Azure', 'ERR_AZURE_ACCESS', "error"),
    FSError: _createError('FSError', 'Unable to perform file operation', 'ERR_FILE_SYSTEM', "error"),
    ACTError: _createError('ACTError', 'Unbale to add new activity', 'ERR_INVALID_ACTIVITY', "error")
}
