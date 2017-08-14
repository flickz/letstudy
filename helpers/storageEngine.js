'use strict'
const azure = require('azure-storage');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const filter = require('./filefilter');
const uuid = require('node-uuid');

const StreamCache = require('stream-cache'); 
const cache = new StreamCache();

let _requestsQueue = [];

const blobName = (file) => {
    let name = file.fieldname + '-' + uuid.v4() + path.extname(file.originalname)
    file.blobName = name;
    return name;
}

// const inValidFileType = (file)=>{
//     let ALLOWED_FILE_TYPES = ['.pdf', '.docs', '.docx', '.txt', '.img'];
//     let fileType = path.extname(file.originalname)
//     if(_.indexOf(ALLOWED_FILE_TYPES, fileType) === -1){
//         return true;
//     }
//     return false;
// }


const validateOptions = (opts)=>{
    let missingParameters = [];
    if (!opts.azureStorageConnectionString) missingParameters.push("azureStorageConnectionString")
    if (!opts.azureStorageAccessKey) missingParameters.push("azureStorageAccessKey")
    if (!opts.azureStorageAccount) missingParameters.push("azureStorageAccount")
    if (!opts.containerName) missingParameters.push("containerName")

    if (missingParameters.length > 0) {
        throw new Error('Missing required parameter' + (missingParameters.length > 1 ? 's' : '') + ' from the options of MulterAzureStorage: ' + missingParameters.join(', '))
    }
}



const defaultSecurity = 'blob'

class MulterAzureStorage {
    constructor (opts) {
        this.containerCreated = false
        this.containerError = false
        
        if(typeof opts === 'string'){
            this.containerName = opts;
            this.blobService = azure.createBlobService(azure.generateDevelopmentStorageCredentials())
        }else{
            validateOptions(opts);
            this.containerName = opts.containerName
            this.blobService = azure.createBlobService(
                opts.azureStorageAccount,
                opts.azureStorageAccessKey,
                opts.azureStorageConnectionString)
        }
        let security = opts.containerSecurity || defaultSecurity            
        this.blobService.createContainerIfNotExists(this.containerName, { publicAccessLevel : security }, (err, result, response) => {
            if (err) {
                this.containerError = true
                //throw new Error('Cannot use container. Check if provided options are correct.')
            }

            this.containerCreated = true

            _requestsQueue.forEach(i => this._removeFile(i.req, i.file, i.cb))
            _requestsQueue = []
        })
    }
    _handleFile(req, file, cb) {
        // if(inValidFileType(file)){
        //     cb(new Error('Invalid File type'))
        // }
        file.stream.pipe(cache);
        file.stream.on('end', ()=>{
            console.log('Dead..')
        })
        // filter.FileFilter(req, file, cache, (err)=>{
        //     if(err){
        //         return cb(new Error(err));
        //     }
             if(this.containerError) {
                cb(new Error('Cannot use container. Check if provided options are correct.'))
            }
            if(!this.containerCreated) {
                _requestsQueue.push({ req: req, file: file, cb: cb })
                return
            }  
            const blob = blobName(file);
            cache.pipe(this.blobService.createWriteStreamToBlockBlob(this.containerName, blob, (err, azureBlob) => {
                if (err) {
                    return cb(err)
                }
                console.log(cache.getLength());
                this.blobService.getBlobProperties(this.containerName, blob, (err, result, response) => {
                    if (err) {
                        return cb(err)
                    }
                    const url = this.blobService.getUrl(this.containerName, blob)
                    return cb(null, {
                        container: result.container,
                        blob: blob,
                        blobType: result.blobType,
                        size: result.contentLength,
                        etag: result.etag,
                        metadata: result.metadata,
                        url: url
                    })
                })
            }))    
       // })

    }

    _removeFile(req, file, cb) {
        if (this.containerError) {
            cb(new Error('Cannot use container. Check if provided options are correct.'))
        }

        if (file.blobName) {
            this.blobService.deleteBlob(this.containerName, file.blobName, cb)
        } else {
            cb(null)
        }
    }
}

/**
 * @param {object | string}      [opts]
 * @param {string}      [opts.azureStorageConnectionString]
 * @param {string}      [opts.azureStorageAccessKey]
 * @param {string}      [opts.azureStorageAccount]
 * @param {string}      [opts.containerName]
 * @param {string}      [opts.containerSecurity]                'blob' or 'container', default: blob
 */
module.exports = function (opts) {
    return new MulterAzureStorage(opts)
}
