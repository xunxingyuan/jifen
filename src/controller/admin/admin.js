const db = require('../../db/index')
const Wx = db.Wx
const Conf = require('../../../conf/conf')
const UserInfo = db.UserInfo
const Upload = db.Upload
const Count = db.Count
const CountDetail = db.CountDetail
const CareerAuth = db.userAuth

const User = db.User
const Json = require('../../tools/jsonResponse')
const fs = require('fs')
const Youzan = require('../youzan/youzan')
const Wechat = require('../wechat/message')



module.exports = {
    getUserList: async (ctx, next) => {
        let query = ctx.request.query
        let text = query.text
        let page = query.page > 0 ? query.page : 0
        let type = query.type
        try {
            let reg = new RegExp(text, 'i')
            let search = {}
            if (type == 0) {
                search = {}
            } else if (type == 1) {
                search = {
                    nick: {
                        $regex: reg
                    }
                }
            } else if (type == 2) {
                search = {
                    phone: {
                        $regex: reg
                    }
                }
            }
            let userResult = await UserInfo.find(search).skip(page * 10).limit(10)
            let totalData = await UserInfo.find(search)
            let result = []
            let total = totalData.length
            userResult.forEach((e) => {
                result.push({
                    "id": e._id,
                    "nick": e.nick,
                    "phone": e.phone,
                    "name": e.name,
                    "areaName": e.areaName,
                    "address": e.address
                })
            })
            Json.res(ctx, 200, '获取成功', {
                users: result,
                total: total
            })
        } catch (error) {
            Json.res(ctx, 201, '获取用户失败')
        }

    },
    getUploadList: async (ctx, next) => {
        let query = ctx.request.query
        let type = query.type
        let text = query.text
        if (!text) {
            text = ''
        }
        let page = query.page > 0 ? query.page : 0
        try {
            let reg = new RegExp(text, 'i')
            let reqData = {}
            if (type == 0) {
                reqData = {
                    $or: [ //多条件，数组
                        {
                            nick: {
                                $regex: reg
                            }
                        },
                        {
                            phone: {
                                $regex: reg
                            }
                        },
                        {
                            feeling: {
                                $regex: reg
                            }
                        }
                    ]
                }
            } else if (type == 1) {
                reqData = {
                    $or: [ //多条件，数组
                        {
                            nick: {
                                $regex: reg
                            },
                            status: 1
                        },
                        {
                            phone: {
                                $regex: reg
                            },
                            status: 1
                        },
                        {
                            feeling: {
                                $regex: reg
                            },
                            status: 1
                        }
                    ]
                }
            } else if (type == 2) {
                reqData = {

                    $or: [ //多条件，数组
                        {
                            nick: {
                                $regex: reg
                            },
                            status: 2
                        },
                        {
                            phone: {
                                $regex: reg
                            },
                            status: 2
                        },
                        {
                            feeling: {
                                $regex: reg
                            },
                            status: 2
                        }
                    ]
                }
            } else if (type == 3) {
                reqData = {
                    $or: [ //多条件，数组
                        {
                            nick: {
                                $regex: reg
                            },
                            status: 0
                        },
                        {
                            phone: {
                                $regex: reg
                            },
                            status: 0
                        },
                        {
                            feeling: {
                                $regex: reg
                            },
                            status: 0
                        }
                    ]
                }
            }
            let uploadList = await Upload.find(reqData).skip(page * 10).limit(10).sort({
                '_id': -1
            })
            let uploadTotal = await Upload.find(reqData)
            Json.res(ctx, 200, '获取成功', {
                uploadList: uploadList,
                total: uploadTotal.length
            })
        } catch (error) {
            Json.res(ctx, 201, '获取用户上传失败')
        }
    },
    //审核上传
    comfirmUpload: async (ctx, next) => {
        let query = ctx.request.query
        let uploadItem = await Upload.findOne({
            _id: query.id
        })
        let wxMsg = await Wx.findOne({
            id: '1'
        })
        if (query.id && query.type) {
            let updateData = {
                status: 0
            }
            if (query.type == 0) {
                updateData.status = 1
            } else if (query.type == 1) {
                updateData.status = 2
            }
            try {

                if (query.type == 0) {
                    let checkResult = await Upload.updateOne({
                        _id: query.id
                    }, {
                        $set: updateData
                    })
                    if (checkResult) {
                        Wechat.sendMessage(uploadItem.openid, {
                            first: wxMsg.comfirmSuccess,
                            keyword1: wxMsg.activeName,
                            keyword2: new Date().toLocaleString(),
                            remark: wxMsg.comfirmSuccessBottom
                        }, '9zta7_Z_3ZGOUPI2MCqjSYdhXfHqU93epzmAo4wU8tg').then((res) => {
                            console.log(res)
                        })
                        Json.res(ctx, 200, '审核成功')
                    } else {
                        Json.res(ctx, 201, '审核失败，稍后重试')
                    }
                    // let addResult = await Youzan.addJfnumber(uploadItem.phone, 100)
                    // if (addResult.data.response && addResult.data.response.is_success) {
                    //     let checkResult = await Upload.updateOne({
                    //         _id: query.id
                    //     }, {
                    //             $set: updateData
                    //         })
                    //     if (checkResult) {
                    //         Wechat.sendMessage(uploadItem.openid, {
                    //             first: wxMsg.comfirmSuccess,
                    //             keyword1: wxMsg.activeName,
                    //             keyword2: new Date().toLocaleString(),
                    //             remark: wxMsg.comfirmSuccessBottom
                    //         }, '9zta7_Z_3ZGOUPI2MCqjSYdhXfHqU93epzmAo4wU8tg').then((res) => {
                    //             console.log(res)
                    //         })
                    //         Json.res(ctx, 200, '审核成功')
                    //     } else {
                    //         Json.res(ctx, 201, '审核失败，稍后重试')
                    //     }
                    // } else {
                    //     Json.res(ctx, 201, '积分新增失败，稍后重试')
                    // }
                } else {
                    let checkResult = await Upload.updateOne({
                        _id: query.id
                    }, {
                        $set: updateData
                    })
                    if (checkResult) {
                        Wechat.sendMessage(uploadItem.openid, {
                            first: wxMsg.confirmFail,
                            keyword1: wxMsg.activeName,
                            keyword2: new Date().toLocaleString(),
                            remark: wxMsg.confirmFailBottom
                        }, '9zta7_Z_3ZGOUPI2MCqjSYdhXfHqU93epzmAo4wU8tg').then((res) => {
                            console.log(res)
                        })
                        Json.res(ctx, 200, '审核成功')
                    } else {
                        Json.res(ctx, 201, '审核失败，稍后重试')
                    }
                }

            } catch (error) {
                Json.res(ctx, 201, '审核失败，稍后重试')
            }

        } else {
            Json.res(ctx, 201, '参数不完整')
        }
    },
    login: (ctx, next) => {
        let query = ctx.request.body
        if (query.user === Conf.admin.user && query.password === Conf.admin.password) {
            Json.res(ctx, 200, '登录成功')
        } else {
            Json.res(ctx, 201, '登录失败')
        }
    },
    //获取积分
    getJf: async (ctx, next) => {
        let query = ctx.request.query
        let phone = query.phone
        phone = Number(phone)
        let result = await Youzan.getJfnumber(phone)
        if (result.data) {
            Json.res(ctx, 200, '获取成功', {
                jifen: result.data
            })
        } else {
            Json.res(ctx, 201, '获取失败，稍后请重试')
        }

    },
    //限制次数
    setLimt: async (ctx, next) => {
        let query = ctx.request.query
        let save = await Wx.updateOne({
            id: '1'
        }, {
            $set: {
                uploadLimit: query.limit
            }
        })
        if (save) {
            Json.res(ctx, 200, '保存成功')
        } else {
            Json.res(ctx, 201, '保存失败')
        }
    },
    //获取次数限制
    getLimt: async (ctx, next) => {
        let result = await Wx.findOne({
            id: '1'
        })
        if (result) {
            Json.res(ctx, 200, '获取成功', {
                limit: result.uploadLimit
            })
        } else {
            Json.res(ctx, 201, '获取失败')
        }
    },
    //获取通知消息，设置通知消息
    getNotice: async (ctx, next) => {
        let result = await Wx.findOne({
            id: '1'
        })
        if (result) {
            Json.res(ctx, 200, '获取成功', {
                "activeName": result.activeName,
                "uploadSuccess": result.uploadSuccess,
                "uploadBottom": result.uploadBottom,
                "confirmFail": result.confirmFail,
                "confirmFailBottom": result.confirmFailBottom,
                "comfirmSuccess": result.comfirmSuccess,
                "comfirmSuccessBottom": result.comfirmSuccessBottom
            })
        } else {
            Json.res(ctx, 201, '获取失败')
        }
    },
    setNotice: async (ctx, next) => {
        let result = ctx.request.query
        let save = await Wx.updateOne({
            id: '1'
        }, {
            $set: {
                "activeName": result.activeName,
                "uploadSuccess": result.uploadSuccess,
                "uploadBottom": result.uploadBottom,
                "confirmFail": result.confirmFail,
                "confirmFailBottom": result.confirmFailBottom,
                "comfirmSuccess": result.comfirmSuccess,
                "comfirmSuccessBottom": result.comfirmSuccessBottom
            }
        })
        if (save) {
            Json.res(ctx, 200, '保存成功')
        } else {
            Json.res(ctx, 201, '保存失败')
        }
    },
    //获取职业测试数据
    getCareerData: async (ctx, next) => {
        let query = ctx.request.query
        let countData = await Count.findOne({
            name: query.channel
        })
        if (countData) {
            Json.res(ctx, 200, '获取成功', {
                userCount: countData.user,
                viewCount: countData.total,
                resultCount: countData.finishTotal,
                shareCount: countData.shareTotal
            })
        } else {
            Json.res(ctx, 200, '获取成功', {
                userCount: 0,
                viewCount: 0,
                resultCount: 0,
                shareCount: 0
            })
        }
    }
}