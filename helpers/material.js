/**
 * Handles material helpers methods
 * @version 1.0
 */
'use strict'

const mongoose = require('mongoose');
const PdfMaterial = mongoose.model('PdfMaterial');
const { DBError } =  require('./errors');

exports.inValidFileType = function(filename){
    let ALLOWED_FILE_TYPES = ['.pdf', '.docs', '.docx', '.txt', '.img'];
    let fileType = path.extname(filename)
    if(_.indexOf(ALLOWED_FILE_TYPES, fileType) === -1){
        return true;
    }
    return false;
}

exports.hasDuplicate = async function(fileType, info){
    switch(fileType){
        case '.pdf':
            if(await _hasDuplicatePdf(info)){
                return true;
            }
            return false;

        default:
            return false;
    }
}

exports.addMetaData = function(fileType, info){
    switch(fileType){
        case '.pdf':
            return _addPdfMetaData(info);
        default: 
            return new Promise((resolve, reject)=>reject("In valid file type"))
    }
}

 let _addPdfMetaData = (info)=>{
    return new Promise((resolve, reject)=>{
        let PdfMetaData = new PdfMaterial({
            courseCode: info.courseCode,
            pages: info.pages,
            page_size: info.page_size,
            file_size: info.file_size
        });
        PdfMetaData.save((err)=>{
            if(err){
                new DBError(err);
                reject(err)
            }
            resolve("Saved");
        })
    })  
}

let _hasDuplicatePdf = (info)=>{
    return new Promise((resolve, reject)=>{
        PdfMaterial.findOne({
            courseCode: info.courseCode,
            pages: info.pages,
            page_size: info.page_size,
            file_size: info.file_size
        }, (err, docs)=>{
            if(err){
                new DBError(err);
                reject(err);
            }
            if(docs){
                resolve(true)
            }else{
                resolve(false);
            }
        })
    })
}
