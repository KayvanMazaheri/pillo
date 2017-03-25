const kue = require('kue')
const async = require('async')
const crypto = require('crypto')
const Pill = require('./../../models/Pill')
const Token = require('./../../models/Token')
let queue = kue.createQueue()

// remind-remind
module.exports = function (job, done) {
  // job.userId;
  // job.pillId;
  // job.methods;
  // job.token;
  Pill.findById(job.data.pillId, (err, pill) => {
    if (err) {
      done(err)
    } else if (!pill) {
      // pill not found int the database so there is no point
      // in attempting this job again
      done()
    } else {
      async.waterfall([
        function (cb) {
          Token.findOneAndRemove({ token: job.data.token, tokenType: 'pill' }, (err, removedToken) => {
            if (err) {
              cb(err)
            } else {
              cb()
            }
          })
        },
        function (cb) {
          crypto.randomBytes(16, function (err, buf) {
            var token = buf.toString('hex')
            cb(err, token)
          })
        },
        function (tokenString, cb) {
          let token = new Token()
          token.token = tokenString
          token.type = 'pill'
          token.data = {
            pillId: pill.id
          }

          pill.tookOne(function (err, updatedPill) {
            if (err) {
              cb(err)
            } else {
              token.expires = updatedPill.rule.currentDate
              token.save(function (err, savedToken) {
                if (err) {
                  cb(err)
                } else {
                  cb(null, savedToken, updatedPill)
                }
              })
            }
          })
        }],
      function (err, savedToken, savedPill) {
        if (err) {
          done(err)
        } else {
          let remindersData = {
            pillId: savedPill.id,
            date: savedPill.rule.currentDate,
            token: savedToken.token
          }
          job.data.methods.forEach(function (method) {
            queue.create(method, remindersData).delay(0).attempts(5).backoff(true).save()
          })
          let remindRemindDate = {
            userId: job.data.userId,
            pillId: job.data.pillId,
            methods: job.data.methods,
            token: savedToken.token
          }
          queue.create('remind-remind', remindRemindDate).delay(remindersData.date).attempts(5).backoff(true).save(function (err) {
            done(err)
          })
        }
      })
    }
  })
}
