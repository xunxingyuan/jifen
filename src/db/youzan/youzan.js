const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
    "id" : Number,
    "client_id" : String,
    "client_secret" : String,
    "kdt_id" : String,
    "access_token" : String,
    "expires_in" : Number,
    "scope" : String
},{ collection: 'youzan' })
module.exports = mySchema