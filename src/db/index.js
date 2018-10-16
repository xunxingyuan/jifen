const mongoose = require("mongoose");
const config = require('../../conf/conf')
const options = {
  user: config.mongodb.auth.user,
  pass: config.mongodb.auth.password,
  path: config.mongodb.path
}

//数据库Schema
const userSchema = require('./user/user')
const wxSchema = require('./wx/wx')
const userInfoSchema = require('./user/userInfo')
const uploadSchema = require('./user/upload')
const youzanSchema = require('./youzan/youzan')

//数据库认证
let authUrl = "mongodb://"+ options.user + ':'+ options.pass + '@' + options.path
mongoose.connect(authUrl,{ useNewUrlParser: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, '连接错误：'))
db.once('open', (callback) => {
  console.log('MongoDB连接成功！！')
})


//导出model
exports.User = mongoose.model('users',userSchema)
exports.UserInfo = mongoose.model('userinfo',userInfoSchema)
exports.Upload = mongoose.model('upload',uploadSchema)
exports.Wx = mongoose.model('wx',wxSchema)
exports.Youzan = mongoose.model('youzan',youzanSchema)


