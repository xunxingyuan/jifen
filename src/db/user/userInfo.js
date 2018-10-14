const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
  openid: String,
  nick: String,
  phone: String,
  name: String,
  areaCode: Array,
  areaName: String,
  address: String
},{ collection: 'userinfo' })
module.exports = mySchema