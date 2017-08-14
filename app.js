const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const passport = require('passport'); 
const MongoStore = require('connect-mongo')(session);
const {DBError} = require('./helpers/errors');

//initialize mongoose schemas
require('./models/user');
require('./models/material');
require('./models/article');

const authenticate = require('./routes/authenticate')(passport);
const materialApi = require('./routes/material')
const articleApi = require('./routes/article');
const userApi = require('./routes/user');

const mongoose = require('mongoose');                         
const pathToMongoDb = 'mongodb://127.0.0.1/cm';

mongoose.Promise = global.Promise;
mongoose.connect(pathToMongoDb, { server: { reconnectTries: 5 } })
        .then(()=>console.log("Connected"))
        .catch((err)=>{
            new DBError(err);
        });

const app = express();

app.use(compression());

app.use(logger('dev'));
app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: false, // don't create session until something stored 
  resave: false, //don't save session if unmodified
  store: new MongoStore({
                    mongooseConnection: mongoose.connection,
                    ttl: 14 * 24 * 60 * 60, // = 14 days. 
                    touchAfter: 24 * 3600 // time period in seconds
              }),
  cookie: {
      maxAge: new Date(Date.now() + (14*24*3600000))
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/auth', authenticate);
app.use('/api/v1/material', materialApi);
app.use('/api/v1/article', articleApi);
app.use('/api/v1/user', userApi);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);  
});

var initPassport = require('./config/passport-init');
initPassport(passport);


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
