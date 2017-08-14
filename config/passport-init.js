const {AddNewActivity} = require('../helpers/activity');
const mongoose = require('mongoose');   
const User = mongoose.model('User');
const LocalStrategy   = require('passport-local').Strategy;
const bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){
	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});
 
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('login', new LocalStrategy({
			passReqToCallback : true,
			usernameField: 'matricNum',
    		passwordField: 'password'
		},
		function(req, username, password, done) { 
			// check in mongo if a user with username exists or not
			User.findOne({ 'matricNum' :  req.body.matricNum }, 
				function(err, user) {
					// In case of any error, return using the done method
					if (err)
						return done(err);
					// Username does not exist, log the error and redirect back
					if (!user){
						console.log('User Not Found with username '+username);
						return done(null, false);                 
					}
					// User exists but wrong password, log the error 
					if (!isValidPassword(user, req.body.password)){
						return done(null, false); // redirect back to login page
					}
					// User and password both match, return user from done method
					// which will be treated like success
					let createdBy = req.body.matricNum;
					AddNewActivity('Login', {
						event: 'Login',
						message: (createdBy)+' Logged in',
						createdBy: createdBy
					});
					return done(null, user);
				}
			);
		}
	));

	passport.use('signup', new LocalStrategy({
			passReqToCallback : true, // allows us to pass back the entire request to the callback
			usernameField: 'matricNum',
    		passwordField: 'password'
		},
		function(req, username, password, done) {
			// find a user in mongo with provided username
			User.findOne({ 'matricNum' :  req.body.matricNum }, function(err, user) {
				// In case of any error, return using the done method
				if (err){
					console.log('Error in SignUp: '+err);
					return done(err);
				}
				// already exists
				if (user) {
					console.log('User already exists with username: '+req.body.matricNum);
					return done(null, false);
				} else {
					// if there is no user, create the user
					var newUser = new User();

					// set the user's local credentials
					newUser.matricNum = req.body.matricNum;
					newUser.password = createHash(req.body.password);
					newUser.name = req.body.name;
					newUser.email = req.body.email;
					newUser.phoneNum = req.body.phoneNum;
					newUser.dept = extractDept(req.body.matricNum);
					newUser.school = req.body.school;
					newUser.level = extractLevel(req.body.matricNum);
					// save the user
					newUser.save(function(err) {
						if (err){
							console.log('Error in Saving user: '+err);  
							throw err;  
						}
						console.log(newUser.matricNum + ' Registration succesful');    
						let createdBy = req.body.matricNum;
						AddNewActivity('Signup', {
							event: 'Signup',
							message: (createdBy)+' Signed up',
							createdBy: createdBy
						});
						return done(null, newUser);
					});
				}
			});
		})
	);
	
	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	};
	// Generates hash using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};
	//Extract the user dept acronym
	var extractDept = function(matricNum){
		return matricNum.slice(0, 3);
	}
	//Extract the user level
	var extractLevel = function(matricNum){
	    var year = new Date().getFullYear();
	    var level = year - (2000 + parseInt(matricNum.slice(4,6))) ;
	    return level+'00L'
	}

};

