const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  openid: String,
  access_token: String,
  expires_time: Number,
  refresh_token: String,
  scope: String
})
module.exports = UserSchema