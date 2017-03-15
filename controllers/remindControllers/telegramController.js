const TelegramBot = require('node-telegram-bot-api');
const async = require('async');
const crypto = require('crypto');
const User = require('../../models/User');
const Token = require('../../models/Token');

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

const telegramBot = new TelegramBot(telegramBotToken, {polling: true});

// get telegram token
telegramBot.onText(/\/start/, function(req, match) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var tokenString = buf.toString('hex');
        done(err, tokenString);
      });
    },
    function(tokenString, done){
      Token.findOne({ tokenType: 'telegram', tokenID: req.chat.id }, function(err, existingToken){
        if (err || !existingToken) {
          let token = new Token();
          token.token = tokenString;
          token.tokenType = 'telegram';
          token.tokenID = req.chat.id;
          token.data = { telegramChatId: req.chat.id };
          token.save(function(err, savedToken) {
            if (err) {
              done(err);
            } else {
              done(null, savedToken.token)
            }
          });
        } else if (new Date(existingToken.expires) <= new Date() ) {
          existingToken.expires = null;
          existingToken.token = tokenString;
          existingToken.save(function(err, savedToken) {
            if (err) {
              done(err);
            } else {
              done(null, savedToken.token)
            }
          });
        } else {
          done(null, existingToken.token);
        }
      });
    }
  ], function(err, tokenString) {
    if (err) {
      telegramBot.sendMessage(req.chat.id, "An error occured, contact system admin for more info.");
    } else {
      let registerTelegramURL = 'http://pillo.ir/link/telegram/' + tokenString;
      telegramBot.sendMessage(req.chat.id, "Click on the link to register your telegram account.");
      telegramBot.sendMessage(req.chat.id, registerTelegramURL);
    }
  });
});

module.exports = function() {

};
