/**
 * Handles Music Services
 * @version 1.0
 */
'use strict'
const async = require('async');
const multer = require('multer')
const path = require('path')
const mongoose = require('mongoose');
const MaterialModel = mongoose.model('Material');
const MulterAzure = require('../helpers/storageEngine');
const {AddNewActivity} = require('../helpers/activity');
const {addNotification} = require('../helpers/notification');
const {DBError, AzureError} = require('../helpers/errors');
const {AzureBlob} = require('../config/azure-storage');
const materialHelper = require('../helpers/filefilter');
const UploadError = require('../helpers/errors').UploadError;
const tempDir = path.join(__dirname, '../temp');

const BlobService = AzureBlob('test');
const containerName = 'materials';

const uploadForStorage = multer({
    limits: {
        fileSize: 50 * 1000000 
    },
    storage: new MulterAzure('materials')
}).single('material')

/**
 * @param {object} req
 * @param {object} res
 * @return {promise}
 */
exports.postMaterialFiles = function(req, res){
    //Get file request and add file to disk
    return new Promise((resolve, reject)=>{
        uploadForStorage(req, res, function(err) {
            if(err) {
                new UploadError(err);
                reject(err);
            }
            let createdBy = req.user.matricNum;
            AddNewActivity('Upload', {
                event: 'Upload',
                message: (createdBy)+' Uploaded new '+(req.body.courseCode)+' material',
                createdBy: createdBy
            });
            addNotification({
                event: 'New_Material',
                targetCourseCode: req.body.courseCode,
                message: req.user.matricNum+ ' shared a material on '+req.body.courseCode,
                createdBy: req.user.id
            }).then(()=>{
                resolve(req.file);
            }).catch((reason)=>{
                reject(reason);
            });
        });
    });
}

/**
 * @param {object} req
 * @return {promise}
 * 
 */
exports.updateMaterialDetails = function(req){ 
   let updatedInfo = {    
        courseCode:req.body.courseCode,
        topic:req.body.topic,
        description: req.body.description,
        type: req.body.type
    }
    //Update materials with the id
    return new Promise((resolve, reject)=>{
        MaterialModel.update({_id: req.params.id}, {$set:updatedInfo}, function(err){
            if(err){
                new DBError(err);
                reject(err);
            }
            let createdBy = req.user.matricNum;
            AddNewActivity('Update', {
                event: 'Update',
                message: (createdBy)+' updated material' + (req.params.id),
                createdBy: createdBy
            });
            resolve();
        });
    });
}
/**
 * @param {object} req
 * @return {promise} 
 */
exports.deleteMaterial = function(req){
    return new Promise((resolve, reject)=>{
        MaterialModel.findOneAndRemove({_id:req.params.id},function(err, doc){
            if(err){
                new DBError(err)
                reject(err);
            }
            BlobService.deleteBlob(containerName, doc.blob, (err)=>{
                if(err){
                    new AzureError(err);
                    reject(err);
                }
                let createdBy = req.user.matricNum;
                AddNewActivity('Delete', {
                    event: 'Delete',
                    message: (createdBy)+' Deleted material '+ (req.params.id),
                    createdBy: createdBy
                });
                resolve();
            }) 
        })
    })
}
/**
 * @param {object} req
 * @return {promise}
 */
exports.getMaterials = function(req){
    let userCourses = JSON.parse(req.query.userCourses);
    return new Promise((resolve, reject)=>{
        MaterialModel.find({courseCode:{$in:userCourses}}, function(err, docs){
            if(err){
                new DBError(err);
                reject(err);
            }

            resolve(docs);
        });
    })
}
/**
 * @param {object} req
 * @return {promise}
 */
exports.getMaterialsById = function(req){
    return new Promise((resolve, reject)=>{
        MaterialModel.findById(req.params.id, function(err, doc){
            if(err){
                new DBError(err);
                reject(err);
            }
            let createdBy = (req.user === undefined)?'Anonymous':req.user.matricNum;
            AddNewActivity('Get', {
                event: 'Get',
                message: (createdBy)+' Requested '+(req.params.id)+' material',
                createdBy: createdBy
            });
            resolve(doc);
	    })
    })
}
