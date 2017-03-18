var moment = require('moment')
var Pill = require('./../models/Pill')

/**
 * GET /pills
 */
exports.pillsGet = function(req, res) {
  let renderData = {
    title: 'Pills',
    moment: moment,
    pills: null
  }
  Pill.find({ userId: req.user.id }, function (err, pills) {
    if (err) {
        req.flash('error', { msg: 'An error occured, contact system admin for more info.' })
        res.render('pills', renderData)
    } else {
      renderData.pills = pills
      res.render('pills', renderData)
    }
  })
}
