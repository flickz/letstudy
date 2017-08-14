/**
 * @version 1.0
 */
'use strict'
const mongoose = require('mongoose');
const async = require('async');
const UM = mongoose.model('User');

const {DBError} = require('../helpers/errors');
const {AddNewActivity} = require('../helpers/activity');
const {getUserNotifications} = require('../helpers/notification');

/**
 * @return {promise}
 */
exports.getUsers = function(){
    return new Promise((resolve, reject)=>{
        UM.find({level:'100L'}, function(err, docs){
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
exports.getUserById = function(req){
    return new Promise((resolve, reject)=>{
        UM.findOne({_id:req.params.id},function(err, doc){
            if(err){
                new DBError(err);
                reject(err);
            }
            let createdBy = (req.user === undefined)?'Anonymous':req.user.matricNum;
            AddNewActivity('Get', {
                event: 'Get',
                message: (createdBy)+' Requested '+(req.params.id)+' info',
                createdBy: createdBy
            });
            resolve(doc);
        });
    });
}

/**
 * @param {object} req
 * @return {promise}
 */
exports.updateUserById = function(req){
    var updatedInfo = {
            name: req.body.name,
            email: req.body.email,
            phoneNum: req.body.phoneNum,
            level:req.body.level
        }
    return new Promise((resolve, reject)=>{
        UM.update({_id: req.user._id}, {$set:updatedInfo}, function(err){
            if(err){
                new DBError(err);
                reject(err);
            }
            let createdBy = req.user.matricNum;
            AddNewActivity('Update', {
                event: 'Update',
                message: (createdBy)+' updated info',
                createdBy: createdBy
            });
            resolve();
         });
    });
}

/**
 * @param {object} req
 */
exports.updateUserCourse = function(req){
    var updatedInfo = {
        mycourseList: req.body.mycourseList
    }
    return new Promise((resolve, reject)=>{
        UM.findByIdAndUpdate({_id: req.user._id}, {$set:updatedInfo}, function(err, doc){
            if(err){
                new DBError(err);
                reject(err);
            }
            let createdBy = req.user.matricNum;
            AddNewActivity('Update', {
                event: 'Update',
                message: (createdBy)+' updated course list',
                createdBy: createdBy
            });
            resolve(doc);
        });
    });
}

/**
 * @param {object} req
 * @return {promise}
 */
exports.getUserCourseList = function(req){
    return new Promise((resolve, reject)=>{
        UM.findOne({_id: req.params.id},function(err, doc){
            if(err){
                new DBError(err);
                reject(err);
            }
            doc = (doc)?doc.mycourseList:'';
            let createdBy = (req.user === undefined)?'Anonymous':req.user.matricNum;
            AddNewActivity('Get', {
                event: 'Get',
                message: (createdBy)+' Requested '+(req.params.id)+' course list',
                createdBy: createdBy
            });
            resolve(doc);
        });
    });
}

/**
 * @param {object} req
 * @return {promise}
 */
exports.deleteUser = function(req){
    return new Promise((resolve, reject)=>{
        UM.remove({_id:req.user._id},(err)=>{
            if(err){
                new DBError(err);
                reject(err);
            }
            let createdBy = req.user.matricNum;
            AddNewActivity('Delete', {
                event: 'Delete',
                message: (createdBy)+' Deleted info',
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
exports.getUserNotifications = function(req){
    return new Promise((resolve, reject)=>{
        getUserNotifications(req).then((docs)=>{
            if(docs){
                resolve(docs);
            }
            resolve('');
        }).catch((reason)=>{
            reject(reason);
        });
    });
}

/**
 * @param {object} req
 */
let getUserSeenNotification = function(req){
    return new Promise((resolve, reject)=>{
        UM.findById(req.params.id || req.user._id, (err, doc)=>{
            if(err){
                new DBError(err);
                reject(err);
            }
            if(doc){
                resolve(doc.notifications);
            }
            resolve('');
        });
    });
}

/**
 * @todo Refactor find and update to use one API
 * @param {object} req
 */
let UpdateUserSeenNotification = function(req){
    //Find the user info to get the array of seen notifications
    //Push the new seen notification to it and update it back
    return new Promise((resolve, reject)=>{
        let userId = req.params.id || req.user._id;
        UM.findById(userId, (err, doc)=>{
            if(err){
                new DBError(err);
                reject(err);
            }
            if(doc){
                let newSeenNote = doc.notifications;
                newSeenNote.push(req.params.notification);
                UM.findByIdAndUpdate(userId, {$set: {notifications: newSeenNote}},(err,doc)=>{
                    if(err){
                        new DBError(err);
                        reject(err);
                    }
                    resolve(doc);          
                });
            }
        });
    });
}