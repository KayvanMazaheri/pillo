let nodemailer = require('nodemailer')

module.exports.createTransport = function () {
  return nodemailer.createTransport({
    service: 'SendPulse',
    auth: {
      user: process.env.SENDPULSE_USERNAME,
      password: process.env.SENDPULSE_PASSWORD
    }
  })
}
