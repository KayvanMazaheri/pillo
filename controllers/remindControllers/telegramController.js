const TelegramBot = require('node-telegram-bot-api');
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

const telegramBot = new TelegramBot(telegramBotToken, {polling: true});
telegramBot.onText(/\/start/, function(req, match) {
  telegramBot.sendMessage(req.chat.id, "HI !");
});

module.exports = function() {

};
