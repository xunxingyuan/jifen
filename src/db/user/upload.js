const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
  openid: String,
  uploadId: String,
  phone: String,
  nick: String,
  feeling: String,
  imgList: Array,
  serveIdlist: Array,
  uploadTime: Number,
  status: Number
},{ collection: 'upload' })
module.exports = mySchema