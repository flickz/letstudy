/**
 * Handles notification CRUD to the db
 * @version 1.0
 */
'use strict';
const mongoose = require('mongoose');
const {DBError} = require('./errors');
const notificationModel = mongoose.model('Notification');

/**
 * Add new notification to DB
 * @param {object} notification
 * @param {string} notification.event
 * @param {string} notification.message
 * @param {string} notification.targetCourseCode
 * @param {string} notification.createdBy
 * @return {promise}
 */
exports.addNotification = function(notification){
   let newNotification = new notificationModel({
       event: notification.event,
       message: notification.message,
       targetCourseCode: notification.targetCourseCode,
       createdBy: notification.createdBy
   });
   return new Promise((resolve, reject)=>{
       newNotification.save((err)=>{
            if(err){
                new DBError(err);
                reject(err);
            }
            resolve();
        });
    });
}

/**
 * Get All notification;
 * @return {promise}
 */
exports.getAllNotification = function(){
    return new Promise((resolve, reject)=>{
        notificationModel.find((err, docs)=>{
            if(err){
                new DBError(err);
                reject(err);
            }
            resolve(docs);
        });
    });
}

/**
 * Get All notification
 * @param {object} req
 * @return {promise}
 */
exports.getUserNotifications = function(req){
    return new Promise((resolve, reject)=>{
        notificationModel.find({targetCourseCode:{$in: req.user.mycourseList}},(err, docs)=>{
            if(err){
                new DBError(err);
                reject(err);
            }
            resolve(docs);
        });
    });
}