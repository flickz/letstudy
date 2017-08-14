'use strict';
const express = require('express');
const router = express.Router();

const US = require('../services/user');

function isAuthenticated (req, res, next) {
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}
	return res.send({state: 'login-failure', mesg: 'Unable to perform request. Kindly login'});
};

router.use('/',isAuthenticated);
router.use('/:id', isAuthenticated);
router.use('/notification/:id', isAuthenticated);
router.use('/mycourse/:id', isAuthenticated);

router.route('/')
	.get(function(req, res){
		US.getUsers().then((docs)=>{
			res.status(200).send(docs);
		}).catch((reason)=>{
			res.status(500).send('Unable to get all user list');
		});
	});

router.route('/:id')
	.get(function(req, res){
		US.getUserById(req).then((doc)=>{
			if(doc){
                res.status(200).send(doc);
            }else{
                res.status(200).send('Wrong id '+req.params.id);
            }
		}).catch((reason)=>{
			res.status(500).send('Unable to get user ID '+req.params.id);
		});
	})
	.put(function(req, res){
		US.updateUserById(req).then(()=>{
			res.status(200).send('User info updated successfully');
		}).catch((reason)=>{
			res.status(500).send('Unable to update user info');
		})
	})
	.delete(function(req, res){
		US.deleteUser(req).then(()=>{
			res.status(200).send('User info successfully Deleted');
		}).catch((reason)=>{
			res.status(500).send('Unable to delete user info');
		});
	});
	
router.route('/mycourse/:id')
	.get(function(req, res){
		US.getUserCourseList(req).then((doc)=>{
			if(doc){
				res.status(200).send(doc);
			}else{
				res.status(200).send('Wrong User id '+ req.params.id);
			}
		}).catch((reson)=>{
			res.status(500).send('Unable to get user Id '+req.params.id+' course list');
		})
	})	
	.put(function(req, res){
		US.updateUserCourse(req).then((doc)=>{
			if(doc){
				res.status(200).send(doc);
			}else{
				res.status(200).send('Wrong User id '+ req.params.id);
			}
		}).catch((reason)=>{
			res.status(500).send('Unable to update user '+req.params.id+' course list');
		});
	});

router.route('/notification/:id')
		.get((req, res)=>{
			US.getUserNotifications(req).then((docs)=>{
				res.status(200).send(docs);
			}).catch((reason)=>{
				res.status(500).send('Unable to get user '+req.params.id+ 'notifications')
			})
		});

module.exports = router;
