/**
 * Handles event that register all activities of the users
 * @version 1.0
 */
'use strict'
const {EventEmitter} = require('events');
const _ = require('lodash');
const Mongoose = require('mongoose');
const ActivityModel = Mongoose.model('Activity');
const {ACTError, DBError} = require('./errors');

const ActivityEvent = new EventEmitter();
let USER_ACTIVITIES = ['Signup', 'Login', 'Logout', 'Upload', 'New_Article',
'Delete', 'Update', 'Get'];

exports.AddNewActivity = function(event, eventDetails){
    if(_.indexOf(USER_ACTIVITIES, event)===-1){
        new ACTError(new Error('Invalid User Activity'));
        return;
    }
    ActivityEvent.on(event, function(details){
        let newAct = new ActivityModel(details);
        newAct.save((err)=>{
            if(err){
                new DBError(err);
            }
        });
    });
    ActivityEvent.emit(event, eventDetails);
}

