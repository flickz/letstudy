/**
 * 
 * @version 1.0
 */
'use strict'

const pdfUtil = require('pdf-to-text');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const materialHelper = require('./material');
const {DBError, UploadError, ScanError, FSError} = require('./errors');

/**
 * @todo Refactor code
 * @param {object} req
 * @param {object} req
 * @param {function} cb
 */
exports.FileFilter = function(req, file, cache, cb){
    let ALLOWED_FILE_TYPES = ['.pdf', '.docs', '.docx', '.txt', '.img'];
    let tempFile = path.join(__dirname, '../temp/'+file.originalname);
    let fileType = path.extname(file.originalname);
    //console.log(tempFile);
    
    let out = fs.createWriteStream(tempFile);
    if(_.indexOf(ALLOWED_FILE_TYPES, fileType) === -1){
        return cb(null, false);
    }

    cache.pipe(out)
    
    out.on('finish', ()=>{
        switch(fileType){
            case '.pdf': 
                return pdfHandler(tempFile, fileType, cb);
            default:
                return cb(new Error('In valid File type'));
        }
    })
    out.on('error', ()=>{
         return cb(new Error("Could not complete the operation"));
    })
}
function pdfHandler(tempFile, fileType, cb){
    pdfUtil.info(tempFile, function(err, info) {
        if(err){
            new ScanError(err)           
            return cb(new Error("Something went wrong"))
        }
        materialHelper.hasDuplicate(fileType, info).then(duplicate=>{
            if(!duplicate){
                materialHelper.addMetaData(fileType, info).then(result=>{
                    fs.unlink(tempFile, (err)=>{
                        if(err){
                            new FSError(err);
                            return cb(new Error("Unable to delete"))
                        }
                        return cb();                        
                    });
                }).catch(reason=>{
                    new DBError(reason);
                    fs.unlink(tempFile, (err)=>{
                        if(err){
                            new FSError(err);
                            return cb(new Error("Unable to delete"))
                        }
                        return cb(new Error('Unable to save materials meta data'));                                       
                    });                   
                })
            }else{
                fs.unlink(tempFile, (err)=>{
                    if(err){
                        new FSError(err);
                        return cb(new Error("Unable to delete"))
                    }
                    return cb(new Error("Duplicate Found"));                
                });
            }            
        }).catch((reason)=>{
            fs.unlink(tempFile, (err)=>{
                if(err){
                    new FSError(err);
                    return cb(new Error("Unable to delete"))
                }
                new DBError(reason);
                return cb(new Error(reason));
            });            
        })
    });
}