var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  title:  String,
  keys: Array,
  about: String,
  picture: String,
  bots: {
    type: Array,
    default: new Array()
  },
  created: { type: Date, default: Date.now },
  nonce: Number,
  meta: Object
});

var userModel = mongoose.model('User', userSchema); 

module.exports = {
  schema: userSchema,
  model: userModel
}