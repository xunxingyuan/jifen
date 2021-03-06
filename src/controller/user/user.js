const db = require('../../db/index')
const Wx = db.Wx
const UserInfo = db.UserInfo
const Upload = db.Upload
const User = db.User
const userAuth = db.userAuth

const axios = require('axios')
const Json = require('../../tools/jsonResponse')
const fs = require('fs')
const Youzan = require('../youzan/youzan')
const Wechat = require('../wechat/message')

const Conf = require('../../../conf/conf')


module.exports = {
    checkAuthUser: async (ctx, next) =>{
        let query = ctx.request.query
        if (query.id) {
            try{
                let user = await User.findOne({
                    _id: query.id
                })
                let userInfo = await userAuth.find({
                    openid: user.openid
                })
                if (userInfo.length === 0) {
                    Json.res(ctx, 201, '用户信息不完整')
                } else {
                    Json.res(ctx, 200, '成功', {
                        nickname: userInfo[0].nickname,
                        sex: userInfo[0].sex,
                        province: userInfo[0].province,
                        city: userInfo[0].city,
                        country: userInfo[0].country,
                        headimgurl: userInfo[0].headimgurl
                    })
                }
            }catch (error) {
                Json.res(ctx, 201, '用户不存在')
            }
        }else{
            Json.res(ctx, 201, '参数不完整')
        }
    },

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
                        address: userInfo[0].address,
                        point: 0
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
        if (query.id && query.nick && query.phone) {
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
                let userInfoSave = await new UserInfo(userData).save()
                if (userInfoSave) {
                    Json.res(ctx, 200, '成功')
                } else {
                    Json.res(ctx, 201, '创建用户故障')
                }


                // try {
                //     let youzanResult = await Youzan.checkUser(query.phone, query.nick)
                //     if (youzanResult.hasOwnProperty('response') && youzanResult.response) {
                //         let userInfoSave = await new UserInfo(userData).save()
                //         if (userInfoSave) {
                //             Json.res(ctx, 200, '成功')
                //         } else {
                //             Json.res(ctx, 201, '创建用户故障')
                //         }
                //     } else {
                //         Json.res(ctx, 201, '创建用户故障')
                //     }

                // } catch (error) {
                //     Json.res(ctx, 201, '用户系统错误')
                // }
            } catch (error) {
                Json.res(ctx, 201, '用户不存在')
            }
        } else {
            Json.res(ctx, 201, '参数不完整')
        }
    },
    updateUser: async (ctx, next) => {
        let query = ctx.request.body
        if (query.id && query.nick && query.phone) {
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
                let uploadData = {
                    phone: query.phone,
                    nick: query.nick
                }
                try {
                    let userInfoSave = await UserInfo.updateOne({
                        openid: user.openid
                    }, {
                            $set: userData
                        })
                    let uploadUpdate = await Upload.updateMany({
                        openid: user.openid
                    }, {
                            $set: uploadData
                        })
                    if (userInfoSave && uploadUpdate) {
                        Json.res(ctx, 200, '成功')
                    } else {
                        Json.res(ctx, 201, '更新失败')
                    }

                } catch (error) {
                    Json.res(ctx, 201, '用户系统错误')
                }
            } catch (error) {
                Json.res(ctx, 201, '用户不存在')
            }
            // let youzanResult = await Youzan.checkUser(query.phone, query.nick)
            // if (youzanResult.hasOwnProperty('response') && youzanResult.response) {
            //     try {
            //         let user = await User.findOne({
            //             _id: query.id
            //         })
            //         let userData = {
            //             nick: query.nick,
            //             phone: query.phone,
            //             name: query.name,
            //             areaCode: JSON.parse(query.areaCode),
            //             areaName: query.areaName,
            //             address: query.address
            //         }
            //         let uploadData = {
            //             phone: query.phone,
            //             nick: query.nick
            //         }
            //         try {
            //             let userInfoSave = await UserInfo.updateOne({
            //                 openid: user.openid
            //             }, {
            //                     $set: userData
            //                 })
            //             let uploadUpdate = await Upload.updateMany({
            //                 openid: user.openid
            //             }, {
            //                     $set: uploadData
            //                 })
            //             if (userInfoSave && uploadUpdate) {
            //                 Json.res(ctx, 200, '成功')
            //             } else {
            //                 Json.res(ctx, 201, '更新失败')
            //             }

            //         } catch (error) {
            //             Json.res(ctx, 201, '用户系统错误')
            //         }
            //     } catch (error) {
            //         Json.res(ctx, 201, '用户不存在')
            //     }
            // } else {
            //     Json.res(ctx, 201, '创建用户故障')
            // }


        } else {
            Json.res(ctx, 201, '参数不完整')
        }
    },
    uploadImg: async (ctx, next) => {
        let query = ctx.request.body
        let now = new Date().getTime()

        if (query.id && query.lists && query.feeling) {

            try {
                let user = await User.findOne({
                    _id: query.id
                })
                let limit = await Wx.findOne({
                    id: '1'
                })
                let timeGet = new Date()
                timeGet.setDate(1)
                timeGet.setHours(0, 0, 0, 0)
                let monthStart = timeGet.getTime()
                timeGet.setMonth(new Date().getMonth() + 1)
                let monthEnd = timeGet.getTime()

                let countUpload = await Upload.find({
                    openid: user.openid,
                    uploadTime: { "$gt": monthStart, "$lte": monthEnd }
                })
                if (countUpload.length < limit.uploadLimit) {
                    try {
                        let src = JSON.parse(query.lists)
                        let wxMsg = await Wx.findOne({
                            id: '1'
                        })
                        let userInfo = await UserInfo.findOne({
                            openid: user.openid
                        })

                        let uploadItem = {
                            openid: user.openid,
                            phone: userInfo.phone,
                            nick: userInfo.nick,
                            feeling: query.feeling,
                            imgList: [],
                            serveIdlist: src,
                            uploadTime: now,
                            status: 0
                        }
                        let getToken = await axios.get('http://yjl.ty6068.com/CJAPI/CJSys/AccessTokenHandler')
                        let ACCESS_TOKEN
                        if (getToken.data.Status) {
                            ACCESS_TOKEN = getToken.data.Data.access_token
                        }

                        try {
                            let result = await getImgFromWx(ACCESS_TOKEN, src)
                            console.log(result)
                            result.forEach((e) => {
                                e = Conf.server.url + e
                                uploadItem.imgList.push(e)
                            })
                            try {
                                let uploadResult = await new Upload(uploadItem).save()
                                Wechat.sendMessage(user.openid, {
                                    first: wxMsg.uploadSuccess,
                                    keyword1: wxMsg.activeName,
                                    keyword2: new Date().toLocaleString(),
                                    remark: wxMsg.uploadBottom
                                }, '9zta7_Z_3ZGOUPI2MCqjSYdhXfHqU93epzmAo4wU8tg').then((res) => {
                                    console.log(res)
                                })
                                if (uploadResult) {
                                    Json.res(ctx, 200, '上传成功')
                                } else {
                                    Json.res(ctx, 201, '用户上传保存1失败')
                                }
                            } catch (error) {
                                Json.res(ctx, 201, '用户上传保存失败')
                            }

                        } catch (error) {
                            Json.res(ctx, 201, '用户上传保存失败')
                        }
                    } catch (error) {
                        Json.res(ctx, 201, '用户上传不存在')
                    }
                } else {
                    Json.res(ctx, 202, '当月上传已经达到最大次数')
                }





            } catch (error) {
                Json.res(ctx, 201, '用户不存在')
            }
        } else {
            Json.res(ctx, 201, '参数不完整')
        }
    },
    testGetFile: async (ctx, next) => {
        // let wxMsg = await Wx.findOne({
        //     id: '1'
        // })
        // let src = ['zDtw6Z1KbNBkf5JNBrpOOx-LJw2m0__5O2MJbhLEV2UEV6x4r5SvL0dGt2D0IPWP', '0kbTGFKhfn1tWOQiwDO0Yq5-uL76FfWz81vifhtTlJM9BKiLq0b15A5ityxna9Hb']
        // let result = await getImgFromWx(wxMsg.accessToken, src)
        // if (result) {
        //     Json.res(ctx, 200, '成功')
        // } else {
        //     Json.res(ctx, 201, '失败')
        // }
        let query = ctx.request.query
        let result = await Youzan.checkUser(query.phone, query.nick)
        // let result = await Youzan.getJfnumber(query.phone)
        // let result = await Youzan.addJfnumber(query.phone, 10)
        console.log(result)
        Json.res(ctx, 200, '成功')
    },
    getUserUpload: async (ctx, next) => {
        let query = ctx.request.query
        if (query.id) {
            try {
                let user = await User.findOne({
                    _id: query.id
                })
                let userUpload = await Upload.find({
                    openid: user.openid
                }).sort({ '_id': -1 })
                if (userUpload) {
                    // let resData = {
                    //     imgUpload: userUpload.imgUpload,
                    //     nick: userUpload.nick,
                    //     phone: userUpload.phone
                    // }
                    Json.res(ctx, 200, '获取成功', {
                        list: userUpload
                    })
                } else {
                    Json.res(ctx, 201, '查找失败')
                }

            } catch (error) {
                Json.res(ctx, 201, '查找失败')
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
        lists.forEach((element, index) => {
            let srcUrl = "https://api.weixin.qq.com/cgi-bin/media/get?access_token=" + token + "&media_id=" + element
            axios({
                method: 'get',
                url: srcUrl,
                responseType: 'stream'
            })
                .then(res => {
                    let now = new Date().getTime() + '_' + Math.floor(Math.random() * 1000)
                    // let type = res.content_type
                    // type = type.relace('image/','')
                    // if(type == 'png'||type=='jpeg'||type == 'gif'||type == 'bmp'){

                    // }else if(type == 'jpeg'||type == 'x-icon'){
                    //     type = 'jpg'
                    // }else{
                    //     type = 'jpg'
                    // }
                    // let imgPath = "/" + now + '.' + type
                    let imgPath = "/" + now + '.jpg'
                    res.data.pipe(fs.createWriteStream(process.cwd() + "/static/imgSrc" + imgPath))
                    all += 1
                    srcList.push("/imgSrc" + imgPath)
                    if (all === flag) {
                        console.log(srcList)
                        resolve(srcList)
                    }
                })
                .catch(err => {
                    console.log(err)
                    reject()
                });
        });

    })
}
