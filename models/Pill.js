var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var getDateOffset = function(milliseconds = 0) {
  var timeObject = new Date();
  timeObject.setTime(timeObject.getTime() + milliseconds);
  return timeObject;
}

var pillSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  icon: String,
  rule: {
    startDate: { type: Date, required: true, default: getDateOffset() },
    endDate: { type: Date, required: true, default: getDateOffset(365 * 24 * 60 * 60 * 1000) },
    currentDate: Date,
    step: { type: Number, required: true, default: 1 * 60 * 60 * 1000 }
  },
  history: { type: Array, required: true, default: [] }
}, schemaOptions);

pillSchema.virtual('rule.nextDate').get(function() {
  let nextDate = new Date();
  nextDate.setTime(this.rule.currentDate.getTime() + this.rule.step);
  return nextDate;
});

pillSchema.methods.updateHistory = function(cb) {
  this.history.push(getDateOffset());
  return this.save(cb);
};

pillSchema.methods.tookOne = function(cb) {
  this.rule.currentDate = this.rule.nextDate;
  return this.save(cb);
};

pillSchema.pre('save', function (next) {
  if(!this.rule.currentDate)
    this.rule.currentDate = this.rule.startDate;
  next();
});

var Pill = mongoose.model('Pill', pillSchema);

module.exports = Pill;
