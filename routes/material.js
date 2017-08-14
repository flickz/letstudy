'use strict';
var express = require('express');
var router = express.Router();
const MS = require('../services/material');

function isAuthenticated (req, res, next) {
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}
	return res.send({state: 'login-failure', mesg: 'Unable to perform request. Kindly login'});
};

router.use('/:id', isAuthenticated);

router.route('/file')
		.post(function(req, res) {
			MS.postMaterialFiles(req, res).then(result=>{
				res.send(result);
			}).catch(reason=>{
				console.log(reason);
				res.send("Failed..");
			})
		});

router.route('/:id')		
		.get(function(req, res){
			 MS.getMaterialsById(req).then(doc=>{
                 console.log(doc);
                 res.status(200);
                 res.send(doc)
             }).catch((reason)=>{
                 console.log(reason);
                 res.sendStatus(500);
                 res.send('Unable to get material at this time');
             });
		})
		.put(function(req, res){
			MS.updateMaterialDetails(req).then(()=>{
                res.status(200);
                res.send('Material Details have been updated');
            }).catch((reason)=>{
                res.status(500);
                res.send('Unable to update material details');
            });
		})
		.delete(function(req, res){
			MS.deleteMaterial(req).then(()=>{
                res.status(200);
                res.send('Material has been Deleted')
            }).catch((reason)=>{
                res.status(500);
                res.send('Unable to delete material at this time');
            });
		});

module.exports = router;
