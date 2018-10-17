const db = require('../../db/index')
const Wx = db.Wx
const Conf = require('../../../conf/conf')
const UserInfo = db.UserInfo
const Upload = db.Upload
const User = db.User
const Json = require('../../tools/jsonResponse')
const fs = require('fs')


module.exports = {
    getUserList: async (ctx, next) => {
            let query = ctx.request.query
            let page = query.page > 0 ? query.page : 0
            try {
                let userResult = await UserInfo.find().skip(page * 10).limit(10)
                let result = []
                let total = ''
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
                console.log(result)
                await UserInfo.count({}, (error, count) => {
                    if (error) {
                        Json.res(ctx, 201, '获取用户总数失败')
                    }
                    total = count
                    Json.res(ctx, 200, '获取成功', {
                        users: result,
                        total: total
                    })
                })

            } catch (error) {
                Json.res(ctx, 201, '获取用户失败')
            }

        },
        getUploadList: async (ctx, next) => {
                let query = ctx.request.query
                let page = query.page > 0 ? query.page : 0
                try {
                    let uploadList = await Upload.find().skip(page * 10).limit(10)
                    let result = []
                    let total = ''
                    uploadList.forEach((e) => {
                        result.push({
                            id: e._id,
                            imgUpload: e.imgUpload,
                            phone: e.phone,
                            nick: e.nick
                        })
                    })
                    await Upload.count({}, (error, count) => {
                        if (error) {
                            Json.res(ctx, 201, '获取用户总数失败')
                        }
                        total = count
                        Json.res(ctx, 200, '获取成功', {
                            uploadList: result,
                            total: total
                        })
                    })
                } catch (error) {
                    Json.res(ctx, 201, '获取用户上传失败')
                }
            },
            //审核上传
            comfirmUpload: async (ctx, next) => {
                    let query = ctx.request.query
                    if (query.uploadUserId && query.id && query.type) {

                        let uploadItem = await Upload.findOne({
                            _id: query.uploadUserId
                        })
                        if(uploadItem){
                            console.log(uploadItem.imgUpload)
                            uploadItem.imgUpload.forEach((e) => {
                                if (e.uploadId === query.id) {
                                    if (query.type == 1) {
                                        e.status = 1
                                    } else {
                                        e.status = 2
                                    }
                                }
                            })
                            try {
                                let result = await Upload.updateOne({
                                    _id: query.uploadUserId
                                },{
                                    $set: {
                                        imgUpload: uploadItem.imgUpload
                                    }
                                })
                                Json.res(ctx, 200, '审核成功')
                            } catch (error) {
                                Json.res(ctx, 201, '更新失败')
                            }
                        }else{
                            Json.res(ctx, 201, '无相关数据')
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
}