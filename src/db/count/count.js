const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
    name: String,
    user: Number,
    total: Number,
    finishTotal: Number,
    shareTotal: Number
},{ collection: 'count' })
module.exports = mySchema