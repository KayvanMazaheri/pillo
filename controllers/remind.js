module.exports.remindMethods = ['remind-telegram', 'remind-push']
module.exports.remindController = require('./remindControllers')
module.exports.telegramController = require('./remindControllers/telegramController')
module.exports.pushController = require('./remindControllers/pushController')
