'use strict';
const express = require('express');
const router = express.Router();
const AS = require('../services/article');

function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}
	return res.send({state: 'login-failure', mesg: 'Unable to perform request. Kindly login'});
};
router.use('/', isAuthenticated);
router.use('/:id', isAuthenticated);

router.route('/')
	.post(function(req, res){
		AS.postArticle(req).then(()=>{
            res.status(200);
            res.send('Article Successfully saved');
        }).catch((reason)=>{
            res.status(500);
            res.send('Unable to save at article');
        });
	})
	.get(function(req, res){
        AS.getArticles(req).then((docs)=>{
            res.status(200);
            res.send(docs);
        }).catch((reason)=>{
            res.status(500);
            res.send('Unable to get article')
        })
	});

router.route('/:id')
	.get(function(req, res){
		AS.getArticleById(req).then((doc)=>{
            if(doc){
                res.status(200);
                res.send(doc);
            }else{
                res.status(200);
                res.send('Wrong id '+req.params.id);
            }
        }).catch((reason)=>{
            res.status(500);
            res.send('Unable to get article '+req.params.id);
        });
	})
    .put(function(req, res){
		AS.updateArticle(req).then(()=>{
            res.status(200);
            res.send('Article Successfully Updated');
        }).catch((reason)=>{
            res.status(500);
            res.send('Unable to update article '+req.params.id);
        });
	})
	.delete(function(req, res){
		AS.deleteArticle(req).then(()=>{
            res.status(200);
            res.send('Successfully removed '+req.params.id);
        }).catch((reason)=>{
            res.status(500);
            res.send('Unable to delete '+req.params.id);
        })
	});

module.exports = router;
