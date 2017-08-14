const azureStorage =  require('azure-storage');
const {AzureError} = require('../helpers/errors');
const defaultSecurity = 'blob';
/**
 * Return azure blobservice
 * @param {string|object} opts
 * @param {string} opts.azureStorageAccount
 * @param {string} opts.azureStorageAccessKey
 * @param {string} opts.azureStorageConnectionString
 * @return {object} 
 */
exports.AzureBlob = function(opts){
    if(typeof opts === 'string'){
        return azureStorage.createBlobService(azureStorage.generateDevelopmentStorageCredentials())
    }
    validateOptions(opts);
    return azureStorage.createBlobService(opts.azureStorageAccount,opts.azureStorageAccessKey,opts.azureStorageConnectionString) 
}

const validateOptions = (opts)=>{
    let missingParameters = [];
    if (!opts.azureStorageConnectionString) missingParameters.push("azureStorageConnectionString")
    if (!opts.azureStorageAccessKey) missingParameters.push("azureStorageAccessKey")
    if (!opts.azureStorageAccount) missingParameters.push("azureStorageAccount")

    if (missingParameters.length > 0) {
        throw new Error('Missing required parameter' + (missingParameters.length > 1 ? 's' : '') + ' from the options of MulterAzureStorage: ' + missingParameters.join(', '))
    }
}
