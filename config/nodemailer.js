let nodemailer = require('nodemailer')

module.exports.createTransport = function () {
  return nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
      user: process.env.MAILGUN_USERNAME,
      pass: process.env.MAILGUN_PASSWORD
    }
  })
}
