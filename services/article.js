/**
 * @version 1.0
 */
'use strict'
const mongoose = require('mongoose');
const _ = require('lodash');
const {DBError} = require('../helpers/errors');
const {AddNewActivity} = require('../helpers/activity');
const {addNotification} = require('../helpers/notification');
const AM = mongoose.model('Article');

/**
 * @param {object} req
 * @return {promise} 
 */
exports.postArticle = function(req){
    req.body.courseCode =  _.toUpper(_.trim(req.body.courseCode));
    var newNM = new AM();
    newNM.articleTitle = req.body.articleTitle;
	newNM.articleBody = req.body.articleBody;
    newNM.courseCode = req.body.courseCode;
	newNM.writtenBy = req.user.id;
    return new Promise((resolve, reject)=>{
        newNM.save(function(err){
            if(err){
                new DBError(err); 
                reject(err);
            }
            let createdBy = req.user.matricNum;
            AddNewActivity('New_Article', {
                event: 'New_Article',
                message: (createdBy)+' Added new '+(req.body.courseCode)+' article',
                createdBy: createdBy
            });
            addNotification({
                event: 'New_Article',
                targetCourseCode: req.body.courseCode,
                message: req.user.matricNum+ ' wrote an article on '+req.body.courseCode,
                createdBy: req.user.id
            }).then(()=>{
                resolve();
            }).catch((reason)=>{
                reject(reason);
            })
        });
    });
}

/**
 * @param {object} req
 * @return {promise}
 */
exports.getArticles = function(req){
    let userCourses = JSON.parse(req.query.courseCode);
    return new Promise((resolve, reject)=>{
        AM.find({courseCode:{$in: userCourses}}, function(err, docs){
            if(err){
                console.log(err)
                new DBError(err);
                reject(err);
            }
            resolve(docs);
        });
    });
}

/**
 * @param {object} req 
 * @return {promise}
 */
exports.getArticleById = function(req){
    return new Promise((resolve, reject)=>{
        AM.findOneAndUpdate({_id:req.params.id},{$inc:{readersNum: 1}}, {new:true},function(err, doc){
            if(err){
                new DBError(err);
                reject(err);
            }
            let createdBy = (req.user === undefined)?'Anonymous':req.user.matricNum;
            AddNewActivity('Get', {
                event: 'Get',
                message: (createdBy)+' Requested '+(req.params.id)+' articles',
                createdBy: createdBy
            });
            resolve(doc);
        });
    });
}

/**
 *  @param {object} req
 *  @return {promise}
 */
exports.updateArticle = function(req){
    req.body.courseCode =  _.toUpper(_.trim(req.body.courseCode));
    let updatedInfo = {
            articleTitle: req.body.articleTitle,
            articleBody: req.body.articleBody,
            courseCode: req.body.courseCode
        }
    return new Promise((resolve, reject)=>{
        AM.update({_id: req.params.id}, {$set:updatedInfo}, function(err){
            if(err){
                new DBError(err);
                reject(err);   
            }
            let createdBy = req.user.matricNum;
            AddNewActivity('Update', {
                event: 'Update',
                message: (createdBy)+' updated article' + (req.params.id),
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
exports.deleteArticle = function(req){
    return new Promise((resolve, reject)=>{
        AM.remove({_id:req.params.id}, function(err){
            if(err){
                new DBError(err);
                reject(err);
            }
            let createdBy = req.user.matricNum;
            AddNewActivity('Delete', {
                event: 'Delete',
                message: (createdBy)+' Deleted article '+ (req.params.id),
                createdBy: createdBy
            });
            resolve();
        });
    });
}