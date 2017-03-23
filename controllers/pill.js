const Moment = require('moment')
const kue = require('kue')
const Pill = require('./../models/Pill')
const remindController = require('./remind')

let queue = kue.createQueue()

/**
 * GET /pill
 */
exports.pillsGet = function(req, res) {
  let renderData = {
    title: 'Pills',
    moment: Moment,
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

/**
 * GET /pill/:id
*/
exports.pillGet = function (req, res) {
  let renderData = {
    title: 'Pills',
    moment: Moment,
    pill: null
  }
  let pillId = req.params.id
  Pill.findById(pillId, function (err, pill) {
    if (err) {
      req.flash('error', { msg: 'An error occured, contact system admin for more info.' })
      res.redirect('/pill')
    } else if (pill.userId != req.user.id) {
      req.flash('error', { msg: 'You are not authorized to view this page.' })
      res.redirect('/pill')
    } else {
      renderData.pill = pill
      res.render('pill', renderData)
    }
  })
}

/**
 * DELETE /pill/:id
*/
exports.pillDelete = function (req, res) {
  let pillId = req.params.id
  Pill.findById(pillId, function (err, pill) {
    if (err) {
      req.flash('error', { msg: 'An error occured, contact system admin for more info.' })
      res.redirect('/pill')
    } else if (pill.userId != req.user.id) {
      req.flash('error', { msg: 'You are not authorized to delete this pill.' })
      res.redirect('/pill')
    } else {
      pill.remove(function (err) {
        if (err) {
          req.flash('error', { msg: 'An error occured, contact system admin for more info.' })
          res.redirect('/pill')
        } else {
          req.flash('success', { msg: 'Your pill has been deleted.' });
          res.redirect('/pill')
        }
      })
    }
  })
}

/**
 * POST /pill
*/
exports.pillPost = function (req, res) {
//  const momentFormat = 'D MMMM, YYYY h:m A'
//  let startDateString = req.body.startDate + ' ' + req.body.startTime
//  let nextDateString = req.body.nextDate + ' ' + req.body.nextTime
//  let startMoment = new Moment(startDateString, momentFormat)
//  let nextMoment = new Moment(nextDateString, momentFormat)
  let startDateString = req.body.startDateUTC
  let nextDateString = req.body.nextDateUTC
  let startMoment = new Moment.utc(startDateString)
  let nextMoment = new Moment.utc(nextDateString)

  let errors = []
  if (!req.body.title || req.body.title.length < 3)
    errors.push({ msg: 'Pill title must be at least 3 characters long.' })
  if (!startMoment.isValid())
      errors.push({ msg: 'Start Date/Time is invalid.' })
  if (!nextMoment.isValid())
      errors.push({ msg: 'Next Date/Time is invalid.' })
  if (nextMoment.isSameOrBefore(startMoment))
      errors.push({ msg: 'Next Date/Time must be after the Start Date/Time.' })
  if(errors && errors.length > 0) {
      req.flash('error', errors)
      return res.redirect('/pills')
  }

  let pill = new Pill()
  pill.userId = req.user.id
  pill.title = req.body.title
  pill.description = req.body.description
  pill.icon = req.body.icon
  pill.rule.startDate = startMoment.toDate()
  pill.rule.step = nextMoment - startMoment

  pill.save(function (err, pill) {
    if (err){
      req.flash('error', { msg: 'An error occured, contact system admin for more info.' })
      res.redirect('/pill')
    } else {
      req.flash('success', { msg: 'New pill added successfully.' });
      let remindRemindData = {
        userId: pill.userId,
        pillId: pill.id,
        methods: remindController.remindMethods
      }
      queue.create('remind-remind', remindRemindData).delay(pill.rule.currentDate).attempts(5).backoff(true).save(function(err) {
        if (err) {
          req.flash('error', { msg: 'An error occured, contact system admin for more info.' })
        }
        res.redirect('/pill')
      })
    }
  })
}
