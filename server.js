var express = require('express')
var path = require('path')
var logger = require('morgan')
var compression = require('compression')
var methodOverride = require('method-override')
var session = require('express-session')
var flash = require('express-flash')
var bodyParser = require('body-parser')
var expressValidator = require('express-validator')
var dotenv = require('dotenv')
var mongoose = require('mongoose')
var passport = require('passport')
var kue = require('kue')
var MongoStore = require('connect-mongo')(session)
var async = require('async')
var basicAuth = require('basic-auth-connect')
var favicon = require('serve-favicon')
var i18next = require('i18next')
var i18nextMiddleware = require('i18next-express-middleware')
var i18nextFilesystemBackend = require('i18next-node-fs-backend')
// Load environment variables from .env file
dotenv.load()

// Kue Job Queue
var queue = kue.createQueue({
  redis: process.env.REDIS_URL
})

// i18n
i18next
  .use(i18nextMiddleware.LanguageDetector)
  .use(i18nextFilesystemBackend)
  .init({
    backend: {
      loadPath: 'locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      caches: ['cookie']
    },
    debug: false
  })

// Controllers
var HomeController = require('./controllers/home')
var userController = require('./controllers/user')
var contactController = require('./controllers/contact')
var aboutController = require('./controllers/about')
var remindController = require('./controllers/remind')
var pillController = require('./controllers/pill')
var settingsController = require('./controllers/settings')

// Passport OAuth strategies
require('./config/passport')

var app = express()

// queue.process('remind-console', remindController.consoleController);
// queue.process('remind-email', remindController.emailController);
// queue.process('remind-sms', remindController.smsController);
queue.process('remind-push', remindController.pushController)
queue.process('remind-telegram', remindController.telegramController)
queue.process('remind-remind', remindController.remindController)

mongoose.connect(process.env.MONGODB)
mongoose.connection.on('error', function () {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.')
  process.exit(1)
})
app.use(i18nextMiddleware.handle(i18next))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.set('port', process.env.PORT || 3000)
app.use(compression())
app.use(logger('dev'))
app.use(favicon(path.join(__dirname, 'public', 'assets', 'image', 'favicon.ico')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())
app.use(methodOverride('_method'))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    touchAfter: 24 * 3600
  })
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(function (req, res, next) {
  res.locals.user = req.user
  next()
})
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', HomeController.index)
app.get('/pill', userController.ensureAuthenticated, pillController.pillsGet)
app.get('/pill/:id', userController.ensureAuthenticated, pillController.pillGet)
app.put('/pill/:id', userController.ensureAuthenticated, pillController.pillPut)
app.delete('/pill/:id', userController.ensureAuthenticated, pillController.pillDelete)
app.post('/pill', userController.ensureAuthenticated, pillController.pillPost)
app.get('/about', aboutController.aboutGet)
app.get('/contact', contactController.contactGet)
app.post('/contact', contactController.contactPost)
app.get('/account', userController.ensureAuthenticated, userController.accountGet)
app.put('/account', userController.ensureAuthenticated, userController.accountPut)
app.delete('/account', userController.ensureAuthenticated, userController.accountDelete)
app.get('/signup', userController.signupGet)
app.post('/signup', userController.signupPost)
app.get('/login', userController.loginGet)
app.post('/login', userController.loginPost)
app.get('/forgot', userController.forgotGet)
app.post('/forgot', userController.forgotPost)
app.get('/reset/:token', userController.resetGet)
app.post('/reset/:token', userController.resetPost)
app.get('/logout', userController.logout)
app.get('/settings', userController.ensureAuthenticated, settingsController.settingsGet)
app.post('/link/push', userController.ensureAuthenticated, settingsController.link.pushPost)
app.get('/link/telegram/:token', userController.ensureAuthenticated, settingsController.link.telegramGet)
app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink)
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }))
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }))

app.use('/kue', basicAuth(process.env.KUE_WEB_USER, process.env.KUE_WEB_PASSWORD), kue.app)

// Production error handler
if (app.get('env') === 'production') {
  // unhandled routes
  app.use(function (req, res) {
    let status = 403
    res.status(status).render('error', { title: 'Error', status: status })
  })

  // internal server errors
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    let status = err.status || 500
    // res.sendStatus(status)
    res.status(status).render('error', { title: 'Error', status: status })
  })
}

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})

let gracefulExitHandler = function () {
  async.series([
    function (callback) {
      mongoose.connection.close(function (err) {
        if (err) {
          console.log('mongoose disconnect error: ', err)
          callback(err)
        } else {
          console.log('mongoose connection is disconnected through app termination.')
          callback(null)
        }
      })
    },
    function (callback) {
      queue.shutdown(5000, function (err) {
        if (err) {
          console.log('queue shutdown error: ', err)
          callback(err)
        } else {
          console.log('kue is shut down through app termination.')
          callback(null)
        }
      })
    }
  ],
  function (err, results) {
    if (err) {
      console.log('graceful termination failed.')
      process.exit()
    } else {
      process.exit(0)
    }
  })
}

process.once('SIGINT', gracefulExitHandler)
process.once('SIGTERM', gracefulExitHandler)

module.exports = app
