const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
    userId: String,
    time: Number
},{ collection: 'countdetail' })
module.exports = mySchema