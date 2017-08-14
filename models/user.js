const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
	matricNum: String, //hash created from password
	password: String,
	name: String, 
	email:String,
	phoneNum: Number,
	dept:String,
	level: String,
	mycourseList: [],
	notifications: [], //seen notifications
	createdAt: {type: Date, default: Date.now}
});

const notificationSchema = new mongoose.Schema({
	event: String,
	message: String,
	targetCourseCode: String,
	createdBy: String,	
	createdAt: {type: Date, default: Date.now}
});

const activitySchema = new mongoose.Schema({
	event: String,
	message: String,
	createdBy: String,
	createdAt: {type: Date, default: Date.now}
});

mongoose.model('Activity', activitySchema);
mongoose.model('Notification', notificationSchema);
mongoose.model('User', userSchema);