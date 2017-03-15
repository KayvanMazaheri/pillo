var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var getExpireDefault = function(milliseconds) {
  var timeObject = new Date();
  timeObject.setTime(timeObject.getTime() + milliseconds);
  return timeObject;
}

var tokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  tokenType: { type: String },
  tokenID: { type: String }
  data: { type: Object },
  expires: { type: Date, required: true, default: getExpireDefault(3 * 60 * 60 * 1000) }
}, schemaOptions);

userSchema.options.toJSON = {
  transform: function(doc, ret, options) {
    delete ret.expires;
  }
};

var Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
