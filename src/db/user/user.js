const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  phone: String,
  id: String,
  name: String,
  nick: String,
  email: String,
  level: Number,
  create: Number,
  experience: Number,
  icon: String,
  introduce: String
})
module.exports =  UserSchema