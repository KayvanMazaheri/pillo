var mongoose = require('mongoose')

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
}

var getExpireDefault = function (milliseconds = 60 * 1000) {
  var timeObject = new Date()
  timeObject.setTime(timeObject.getTime() + milliseconds)
  return timeObject
}

var tokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  tokenType: { type: String },
  tokenID: { type: String },
  data: { type: Object },
  expires: { type: Date, required: true, default: getExpireDefault(), set: function (val) { return val || getExpireDefault() } }
}, schemaOptions)
//
// tokenSchema.pre('save', function(next) {
//   var token = this;
//   if (token.expires && !token.isModified('expires')) { return next(); }
//   if (token.expires == null) token.expires = getExpireDefault();
//   next();
// });

tokenSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    delete ret.expires
  }
}

var Token = mongoose.model('Token', tokenSchema)

module.exports = Token
