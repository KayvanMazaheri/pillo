var express = require('express');
var path = require('path');
var logger = require('morgan');
var compression = require('compression');
var methodOverride = require('method-override');
var session = require('express-session');
var flash = require('express-flash');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var passport = require('passport');
var kue = require('kue');
var mongoStore = require('connect-mongo')(session);
var async = require('async')

// Load environment variables from .env file
dotenv.load();

// Kue Job Queue
var queue = kue.createQueue({
  redis: process.env.REDIS_URL
});

// Controllers
var HomeController = require('./controllers/home');
var userController = require('./controllers/user');
var contactController = require('./controllers/contact');
var remindController = require('./controllers/remind');
var pillsController = require('./controllers/pills');

// Passport OAuth strategies
require('./config/passport');

var app = express();

// queue.process('remind-console', remindController.consoleController);
// queue.process('remind-email', remindController.emailController);
// queue.process('remind-sms', remindController.smsController);
queue.process('remind-telegram', remindController.telegramController);
queue.process('remind-remind', remindController.remindController);

mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store : new mongoStore({
		mongooseConnection : mongoose.connection,
		touchAfter: 24 * 3600
	})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', HomeController.index);
app.get('/pills', userController.ensureAuthenticated, pillsController.pillsGet);
app.post('/pill', userController.ensureAuthenticated, pillsController.pillPost);
app.get('/contact', contactController.contactGet);
app.post('/contact', contactController.contactPost);
app.get('/account', userController.ensureAuthenticated, userController.accountGet);
app.put('/account', userController.ensureAuthenticated, userController.accountPut);
app.delete('/account', userController.ensureAuthenticated, userController.accountDelete);
app.get('/signup', userController.signupGet);
app.post('/signup', userController.signupPost);
app.get('/login', userController.loginGet);
app.post('/login', userController.loginPost);
app.get('/forgot', userController.forgotGet);
app.post('/forgot', userController.forgotPost);
app.get('/reset/:token', userController.resetGet);
app.post('/reset/:token', userController.resetPost);
app.get('/logout', userController.logout);
app.post('/link/push', userController.ensureAuthenticated, userController.link.pushPost);
app.get('/link/telegram/:token', userController.ensureAuthenticated, userController.link.telegramGet);
app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));

// Production error handler
if (app.get('env') === 'production') {
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(err.status || 500);
  });
}

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

let gracefulExitHandler = function() {
  async.series([
    function(callback) {
      mongoose.connection.close(function(err) {
        if (err) {
          console.log("mongoose disconnect error: ", err)
          callback(err)
        } else {
          console.log("mongoose connection is disconnected through app termination.")
          callback()
        }
      })
    },
    function(callback) {
      queue.shutdown(function(err) {
        if (err) {
          console.log("queue shutdown error: ", err)
          callback(err)
        } else {
          console.log("kue is shut down through app termination.")
        }
      })
    }
  ],
  function(error, results) {
    if(err) {
      console.log("graceful termination failed.")
      process.exit()
    } else {
      process.exit(0)
    }
  })
}

process.once('SIGINT', gracefulExitHandler)
process.once('SIGTERM', gracefulExitHandler)

module.exports = app;
