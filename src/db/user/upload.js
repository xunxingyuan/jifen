const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
  openid: String,
  imgUpload: Array,
  phone: String,
  nick: String
},{ collection: 'upload' })
module.exports = mySchema