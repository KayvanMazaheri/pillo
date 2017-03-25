const TelegramBot = require('node-telegram-bot-api')
const async = require('async')
const crypto = require('crypto')
const User = require('../../models/User')
const Token = require('../../models/Token')
const Pill = require('../../models/Pill')

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN

const telegramBot = new TelegramBot(telegramBotToken, {polling: true})

// Display Help
// /start and /help
telegramBot.onText(/\/(start|help)/, function (req, match) {
  let text = 'Hello ' + (req.chat.first_name || req.chat.username || 'Friend') + ',\n'
  text += 'Pillo is a simple medication reminder.\n\n'
  text += 'Start by connecting your Pillo account to Telegram by touching:\n'
  text += '/token\n\n\n'
  text += 'Visit http://pillo.ir for more info.'

  let options = {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: [
        [
          {
            text: '/help'
          }
        ],
        [
          {
            text: '/token'
          }
        ]
      ]
    }
  }
  telegramBot.sendMessage(req.chat.id, text, options)
})

// Get Telegram Token
// /token
telegramBot.onText(/\/token/, function (req, match) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(16, function (err, buf) {
        var tokenString = buf.toString('hex')
        done(err, tokenString)
      })
    },
    function (tokenString, done) {
      Token.findOne({ tokenType: 'telegram', tokenID: req.chat.id }, function (err, existingToken) {
        if (err || !existingToken) {
          let token = new Token()
          token.token = tokenString
          token.tokenType = 'telegram'
          token.tokenID = req.chat.id
          token.data = { telegramChatId: req.chat.id }
          token.save(function (err, savedToken) {
            if (err) {
              done(err)
            } else {
              done(null, savedToken.token)
            }
          })
        } else if (new Date(existingToken.expires) <= new Date()) {
          existingToken.expires = null
          existingToken.token = tokenString
          existingToken.save(function (err, savedToken) {
            if (err) {
              done(err)
            } else {
              done(null, savedToken.token)
            }
          })
        } else {
          done(null, existingToken.token)
        }
      })
    }
  ], function (err, tokenString) {
    if (err) {
      telegramBot.sendMessage(req.chat.id, 'An error occured, contact system admin for more info.')
    } else {
      let registerTelegramURL = 'http://pillo.ir/link/telegram/' + tokenString
      let text = 'Integrate Telegram with your Pillo account.\n\n'
      text += 'Please note that you need to be logged in first.\n'

      let options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Log In',
                url: 'http://pillo.ir/login'
              }
            ],
            [
              {
                text: 'Connect Now!',
                url: registerTelegramURL
              }
            ]
          ]
        }
      }
      telegramBot.sendMessage(req.chat.id, text, options)
      // telegramBot.sendMessage(req.chat.id, registerTelegramURL);
    }
  })
})

module.exports = function (job, done) {
  Pill.findById(job.data.pillId, function (err, pill) {
    if (err) {
      done(err)
    } else if (!pill) {
      // no pill with this id
      done()
    } else {
      User.findById(pill.userId, function (err, user) {
        if (err) {
          done(err)
        } else {
          let telegramChatId = user.telegramToken
          if (!telegramChatId) {
            // telegram is not connected
            done()
          }

          let reminderMessage = 'Hello ' + user.name + '\n'
          reminderMessage += 'It\'s time for your pill.\n\n'
          reminderMessage += pill.title + '\n'
          reminderMessage += (pill.description ? pill.description : '')

          if (pill.icon) {
            telegramBot.sendPhoto(telegramChatId, pill.icon, { caption: reminderMessage })
          } else {
            telegramBot.sendMessage(telegramChatId, reminderMessage)
          }
          done()
        }
      })
    }
  })
}
