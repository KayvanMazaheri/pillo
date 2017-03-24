let nodemailer = require('nodemailer')

module.exports.createTransport = function () {
  return nodemailer.createTransport({
    service: 'Postmark',
    auth: {
      user: process.env.POSTMARK_API_TOKEN,
      pass: process.env.POSTMARK_API_TOKEN
    }
  })
}
