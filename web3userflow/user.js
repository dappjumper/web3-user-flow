var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  address: String,
  created: { type: Date, default: Date.now },
  nonce: Number,
  meta: Object
});

var userModel = mongoose.model('User', userSchema); 

module.exports = {
  schema: userSchema,
  model: userModel
}