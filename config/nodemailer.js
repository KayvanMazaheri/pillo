let nodemailer = require('nodemailer')

module.exports.createTransport = function () {
  return nodemailer.createTransport({
    service: 'SendPulse',
    auth: {
      user: process.env.SENDPULSE_USERNAME,
      pass: process.env.SENDPULSE_PASSWORD
    }
  })
}
