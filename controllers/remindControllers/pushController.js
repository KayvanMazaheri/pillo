const User = require('../../models/User')
const Pill = require('../../models/Pill')
const request = require('request')
const apiURL = 'https://onesignal.com/api/v1/notifications'

const pushTemplate = {
  app_id: process.env.ONESIGNAL_APP_ID,
  url: 'http://pillo.ir/pill',
  headings: { en: 'Pillo' },
  contents: { en: 'Time for your pill.' },
  include_player_ids: null
}

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
          let pushDevices = user.pushDeviceIds
          if (!pushDevices || pushDevices.length < 1) {
            // no push devices
            return done()
          }

          let pushData = pushTemplate

          pushData.include_player_ids = pushDevices

          let reminderMessage = 'Hello ' + user.name + '\n'
          reminderMessage += 'It\'s time for your pill.\n\n'
          reminderMessage += pill.title + '\n'
          reminderMessage += (pill.description ? pill.description : '')

          pushData.contents.en = reminderMessage

          if (pill.icon) {
            pushData.chrome_web_image = pill.icon
          }
          request.post(apiURL, { json: true, body: pushData }, function (err, res, body) {
            if (err) {
              done(err)
            } else {
              done()
            }
          }).auth(null, null, true, process.env.ONESIGNAL_API_KEY)
        }
      })
    }
  })
}
