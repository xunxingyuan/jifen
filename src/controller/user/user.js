const db = require('../../db/index')
const Wx = db.Wx
const UserInfo = db.UserInfo
const Upload = db.Upload
const User = db.User
const axios = require('axios')
const Json = require('../../tools/jsonResponse')
const fs = require('fs')


module.exports = {
    checkUser: async (ctx, next) => {
        let query = ctx.request.query
        if (query.id) {
            try {
                let user = await User.findOne({
                    _id: query.id
                })
                let userInfo = await UserInfo.find({
                    openid: user.openid
                })
                if (userInfo.length === 0) {
                    Json.res(ctx, 201, '用户信息不完整')
                } else {
                    Json.res(ctx, 200, '成功', {
                        nick: userInfo[0].nick,
                        phone: userInfo[0].phone,
                        name: userInfo[0].name,
                        areaCode: userInfo[0].areaCode,
                        areaName: userInfo[0].areaName,
                        address: userInfo[0].address
                    })
                }
            } catch (error) {
                Json.res(ctx, 201, '用户不存在')
            }
        } else {
            Json.res(ctx, 201, '参数不完整')
        }
    },
    addUser: async (ctx, next) => {
        let query = ctx.request.body
        if (query.id && query.nick) {
            try {
                let user = await User.findOne({
                    _id: query.id
                })
                let userData = {
                    openid: user.openid,
                    nick: query.nick,
                    phone: query.phone,
                    name: query.name,
                    areaCode: JSON.parse(query.areaCode),
                    areaName: query.areaName,
                    address: query.address
                }
                let uploadData = {
                    openid: user.openid,
                    imgUpload: []
                }
                try {
                    let userInfoSave = await new UserInfo(userData).save()
                    let uploadSave = await new Upload(uploadData).save()
                    Json.res(ctx, 200, '成功')
                } catch (error) {
                    Json.res(ctx, 201, '用户系统错误')
                }
            } catch (error) {
                Json.res(ctx, 201, '用户不存在')
            }
        } else {
            Json.res(ctx, 201, '参数不完整')
        }
    },
    updateUser: async (ctx, next) => {
        let query = ctx.request.body
        if (query.id && query.nick) {
            try {
                let user = await User.findOne({
                    _id: query.id
                })
                let userData = {
                    nick: query.nick,
                    phone: query.phone,
                    name: query.name,
                    areaCode: JSON.parse(query.areaCode),
                    areaName: query.areaName,
                    address: query.address
                }
                try {
                    let userInfoSave = await UserInfo.updateOne({
                        openid: user.openid
                    }, {
                            $set: userData
                        })
                    Json.res(ctx, 200, '成功')
                } catch (error) {
                    Json.res(ctx, 201, '用户系统错误')
                }
            } catch (error) {
                Json.res(ctx, 201, '用户不存在')
            }
        } else {
            Json.res(ctx, 201, '参数不完整')
        }
    },
    uploadImg: async (ctx, next) => {
        let query = ctx.request.body
        let now = new Date().getTime()
        if (query.id && query.lists) {

            try {
                let user = await User.findOne({
                    _id: query.id
                })
                try {
                    let src = JSON.parse(query.lists)
                    let wxMsg = await Wx.findOne({
                        id: '1'
                    })
                    let imgUploadData = [{
                        updateTime: now,
                        serverIdList: src,
                        srcList: [],
                        status: 0
                    }]

                    try {
                        let result = await getImgFromWx(wxMsg.accessToken, src)
                        console.log(result)
                        result.forEach((e) => {
                            imgUploadData[0].srcList.push(e)
                        })
                        try{
                            let uploadResult = await Upload.updateOne({
                                openid: user.openid
                            }, {
                                    $addToSet: {
                                        imgUpload: imgUploadData
                                    }
                                })
                            Json.res(ctx, 200, '上传成功')
                        }catch (error) {
                            Json.res(ctx, 201, '用户上传保存1失败')
                        }
                        
                    } catch (error) {
                        Json.res(ctx, 201, '用户上传保存失败')
                    }
                } catch (error) {
                    Json.res(ctx, 201, '用户上传不存在')
                }

            } catch (error) {
                Json.res(ctx, 201, '用户不存在')
            }
        } else {
            Json.res(ctx, 201, '参数不完整')
        }
    }
}

//获取微信图片并保存
function getImgFromWx(token, lists) {
    return new Promise((resolve, reject) => {
        let flag = lists.length
        let all = 0
        let srcList = []
        lists.forEach((element,index) => {
            let srcUrl = "https://api.weixin.qq.com/cgi-bin/media/get?access_token=" + token + "&media_id=" + element
            console.log(srcUrl)
            axios.get(srcUrl).then((res) => {
                
                console.log(res)
                //接收前台POST过来的base64
                let imgData = res.data
                //过滤data:URL
                let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
                let dataBuffer = new Buffer(base64Data, 'base64');
                let now = new Date().getTime() + '_' + Math.floor(Math.random() * 1000)
                let imgPath = "/" + now + '.jpg'
                fs.writeFile(process.cwd() + "/imgSrc" + imgPath, dataBuffer, function (err) {
                    if (err) {
                        console.log(err)
                        console.log('save fail')
                    } else {
                        console.log('save success')
                        all += 1
                        srcList.push("/imgSrc" + imgPath)
                        if (all === flag) {
                            resolve(srcList)
                        }
                    }
                });
            })
        });
        // if (all === flag) {
        //     resolve(srcList)
        // } else {
        //     reject()
        // }
    })
}