var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  address: String,
  created: { type: Date, default: new Date().getTime() },
  nonce: {
  	type: Number,
  	default: 0
  },
  meta: Object
});

var userModel = mongoose.model('User', userSchema); 

module.exports = {
  schema: userSchema,
  model: userModel
}