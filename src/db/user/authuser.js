const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
  openid: String,
  nickname: String,
  sex: String,
  province: String,
  city: String,
  country: String,
  headimgurl: String,
  channel: Array
},{ collection: 'authuser' })
module.exports = mySchema