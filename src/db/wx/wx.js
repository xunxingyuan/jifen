const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
    appID: String,
    appsecret: String,
    accessToken: String,
    accessToken_expires: Number,
    ticket: String,
    ticket_expires: Number,
    uploadLimit: Number,
    activeName: String,
    uploadSuccess : String,
    uploadBottom : String,
    confirmFail : String,
    confirmFailBottom : String,
    comfirmSuccess : String,
    comfirmSuccessBottom : String
},{ collection: 'wx' })
module.exports = mySchema