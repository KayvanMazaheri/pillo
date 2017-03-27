var User = require('../models/User')
var Token = require('../models/Token')

exports.settingsGet = function (req, res) {
  res.render('settings', {
    title: 'Settings'
  })
}

exports.link = {}

/**
 * POST /link/push
 */
exports.link.pushPost = function (req, res, next) {
  var deviceId = req.body.deviceId
  if (!(deviceId && deviceId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i))) {
    req.flash('error', { msg: 'Device ID is not valid or not available.' })
    return res.redirect('/settings')
  }
  User.findById(req.user.id, function (err, user) {
    if (err) {
      req.flash('error', { msg: err })
      res.redirect('/settings')
    } else if (user.pushDeviceIds.indexOf(deviceId) === -1) {
      user.pushDeviceIds.push(deviceId)
      user.save(function (err) {
        if (err) {
          req.flash('error', { msg: err })
        } else {
          req.flash('success', { msg: 'Device linked successfully.' })
        }
        res.redirect('/settings')
      })
    } else {
      req.flash('error', { msg: 'Device already linked.' })
      res.redirect('/settings')
    }
  })
}

/**
 * POST /link/telegram/:token
 */
exports.link.telegramGet = function (req, res, next) {
  var telegramToken = req.params.token
  if (!telegramToken) {
    req.flash('error', { msg: 'Telegram token is invalid or has expired. Get a token from @PilloRobot.' })
    return res.redirect('/settings')
  }
  Token.findOne({ token: telegramToken, tokenType: 'telegram' })
    .where('expires').gt(Date.now())
    .exec(function (err, token) {
      if (err || !token) {
        req.flash('error', { msg: 'Telegram token is invalid or has expired. Get a token from @PilloRobot.' })
        return res.redirect('/settings')
      } else {
        User.findById(req.user.id, function (err, user) {
          if (err) {
            req.flash('error', { msg: 'An error occured, contact system admin for more info.' })
            return res.redirect('/settings')
          } else if (user.telegramToken === token.data.telegramChatId) {
            req.flash('error', { msg: 'Telegram client already linked.' })
            return res.redirect('/settings')
          } else {
            user.telegramToken = token.data.telegramChatId
            user.save(function (err) {
              if (err) {
                req.flash('error', { msg: err })
              } else {
                req.flash('success', { msg: 'Telegram client linked successfully.' })
              }
              return res.redirect('/settings')
            })
          }
        })
      }
    })
}
