const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
    careerTotal: Number,
    careerFinishTotal: Number
},{ collection: 'count' })
module.exports = mySchema